#!/usr/bin/env node

import commandLineArgs from 'command-line-args';
import { js_beautify } from 'js-beautify';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';

import migrate from '../lib/migrate';
import pathConfig from '../lib/pathconfig';

interface Options {
  preview?: boolean;
  name?: string;
  comment?: string;
  execute?: boolean;
  'migrations-path'?: string;
  'models-path'?: string;
  help?: boolean;
}

const optionDefinitions: Array<{
  name: string;
  alias?: string;
  type: any;
  description: string;
}> = [
  {
    name: 'preview',
    alias: 'p',
    type: Boolean,
    description: 'Show migration preview (does not change any files)',
  },
  {
    name: 'name',
    alias: 'n',
    type: String,
    description: 'Set migration name (default: "noname")',
  },
  {
    name: 'comment',
    alias: 'c',
    type: String,
    description: 'Set migration comment',
  },
  {
    name: 'execute',
    alias: 'x',
    type: Boolean,
    description: 'Create new migration and execute it',
  },
  {
    name: 'migrations-path',
    type: String,
    description: 'The path to the migrations folder',
  },
  {
    name: 'models-path',
    type: String,
    description: 'The path to the models folder',
  },
  { name: 'help', type: Boolean, description: 'Show this message' },
];

const options: Options = commandLineArgs(optionDefinitions);

if (options.help) {
  console.log('Sequelize migration creation tool\n\nUsage:');
  optionDefinitions.forEach((option) => {
    const alias = option.alias ? ` (-${option.alias})` : '\t';
    console.log(`\t --${option.name}${alias} \t${option.description}`);
  });
  process.exit(0);
}

// Windows support
if (!process.env.PWD) {
  process.env.PWD = process.cwd();
}

const { migrationsDir, modelsDir, genTsFilePath } = pathConfig(options);

if (!fs.existsSync(modelsDir)) {
  console.log("Can't find models directory. Use `sequelize init` to create it");
  process.exit(1);
}

if (!fs.existsSync(genTsFilePath || migrationsDir)) {
  console.log(
    "Can't find migrations directory. Use `sequelize init` to create it",
  );
  process.exit(1);
}

// current state
const currentState: {
  tables: Record<string, any>;
  revision?: number;
} = {
  tables: {},
};

// load last state
let previousState = {
  revision: 0,
  version: 1,
  tables: {},
};

try {
  previousState = JSON.parse(
    fs.readFileSync(
      path.join(genTsFilePath || migrationsDir, '_current.json'),
      'utf-8',
    ),
  );
} catch (e) {}

// Load sequelize instance
const sequelize = require(modelsDir).sequelize;
const models = sequelize.models;

currentState.tables = migrate.reverseModels(sequelize, models);

const actions = migrate.parseDifference(
  previousState.tables,
  currentState.tables,
);

let upActions = migrate.parseDifference(
  previousState.tables,
  currentState.tables,
);
let downActions = migrate.parseDifference(
  currentState.tables,
  previousState.tables,
);

// sort actions
migrate.sortActions(upActions);
migrate.sortActions(downActions);

let migration = migrate.getMigration(upActions, downActions);

if (migration.commandsUp.length === 0) {
  console.log('No changes found');
  process.exit(0);
}

// log migration actions
_.each(migration.consoleOut, (v) => {
  console.log('[Actions] ' + v);
});

if (options.preview) {
  console.log('Migration result:');
  console.log(
    js_beautify('[ \n' + migration.commandsUp.join(', \n') + ' \n];\n'),
  );
  process.exit(0);
}

// backup _current file
if (fs.existsSync(path.join(genTsFilePath || migrationsDir, '_current.json'))) {
  fs.writeFileSync(
    path.join(genTsFilePath || migrationsDir, '_current_bak.json'),
    fs.readFileSync(
      path.join(genTsFilePath || migrationsDir, '_current.json'),
      'utf-8',
    ),
  );
}

// save current state
currentState.revision = previousState.revision + 1;
fs.writeFileSync(
  path.join(genTsFilePath || migrationsDir, '_current.json'),
  JSON.stringify(currentState, null, 4),
);

// write migration to file
const info = (
  genTsFilePath ? migrate.writeMigration : migrate.writeMigrationJS
)(
  currentState.revision,
  migration,
  genTsFilePath || migrationsDir,
  options.name || 'noname',
  options.comment || '',
);

console.log(
  `New migration to revision ${currentState.revision} has been saved to file '${info.filename}'`,
);

if (options.execute) {
  migrate.executeMigration(
    sequelize.getQueryInterface(),
    info.filename,
    true,
    0,
    false,
    (err) => {
      if (!err) {
        console.log('Migration has been executed successfully');
      } else {
        console.log('Errors during migration execution', err);
      }
      process.exit(0);
    },
  );
} else {
  process.exit(0);
}
