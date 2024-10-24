#!/usr/bin/env node

import path from 'path';
import commandLineArgs from 'command-line-args';
import fs from 'fs';
import Async from 'async';

import migrate from '../lib/migrate';
import pathConfig from '../lib/pathconfig';

interface Options {
  rev?: number;
  pos?: number;
  one?: boolean;
  list?: boolean;
  'migrations-path'?: string;
  'models-path'?: string;
  help?: boolean;
  rollback: number;
}

const optionDefinitions: Array<{
  name: string;
  alias?: string;
  type: any;
  description: string;
  defaultValue?: any;
}> = [
  {
    name: 'rev',
    alias: 'r',
    type: Number,
    description: 'Set migration revision (default: 0)',
    defaultValue: 0,
  },
  {
    name: 'rollback',
    alias: 'b',
    type: Number,
    description: 'Rollback to specified revision',
    defaultValue: false,
  },
  {
    name: 'pos',
    alias: 'p',
    type: Number,
    description:
      'Start executing from the nth command in the file (default: 0),',
    defaultValue: 0,
  },
  {
    name: 'no-transaction',
    type: Boolean,
    description:
      'Run each change separately instead of all in a transaction (allows it to fail and continue)',
    defaultValue: false,
  },
  {
    name: 'one',
    type: Boolean,
    description: 'Execute only the latest one',
    defaultValue: false,
  },
  {
    name: 'list',
    alias: 'l',
    type: Boolean,
    description: 'Show migration file list (without execution)',
    defaultValue: false,
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

// Windows support
if (!process.env.PWD) {
  process.env.PWD = process.cwd();
}

const { migrationsDir, modelsDir } = pathConfig(options);

if (!fs.existsSync(modelsDir)) {
  console.log("Can't find models directory. Use `sequelize init` to create it");
  process.exit(1);
}

if (!fs.existsSync(migrationsDir)) {
  console.log(
    "Can't find migrations directory. Use `sequelize init` to create it",
  );
  process.exit(1);
}

if (options.help) {
  console.log('Simple sequelize migration execution tool\n\nUsage:');
  optionDefinitions.forEach((option) => {
    const alias = option.alias ? ` (-${option.alias})` : '\t';
    console.log(`\t --${option.name}${alias} \t${option.description}`);
  });
  process.exit(0);
}

const sequelize = require(modelsDir).sequelize;
const queryInterface = sequelize.getQueryInterface();

// execute all migration from
const fromRevision = options.rev || 0;
let fromPos = options.pos ? parseInt(options.pos.toString()) : 0;
const stop = options.one;
let rollback = options.rollback;
let noTransaction = options['no-transaction'];

const migrationFiles = fs
  .readdirSync(migrationsDir)
  // filter JS files
  .filter((file) => {
    return file.indexOf('.') !== 0 && file.slice(-3) === '.js';
  })
  // sort by revision
  .sort((a, b) => {
    const revA = parseInt(path.basename(a).split('-', 2)[0]);
    const revB = parseInt(path.basename(b).split('-', 2)[0]);
    if (typeof rollback === 'number') {
      if (revA < revB) return 1;
      if (revA > revB) return -1;
    } else {
      if (revA < revB) return -1;
      if (revA > revB) return 1;
    }
    return revA - revB;
  })
  // remove all migrations before fromRevision
  .filter((file) => {
    const rev = parseInt(path.basename(file).split('-', 2)[0]);
    return rev >= fromRevision;
  });

console.log('Migrations to execute:');
migrationFiles.forEach((file) => {
  console.log('\t' + file);
});

if (options.list) {
  process.exit(0);
}

Async.eachSeries(
  migrationFiles.slice(0, rollback || migrationFiles.length),
  function (file, callback) {
    console.log('Execute migration from file: ' + file);
    migrate.executeMigration(
      queryInterface,
      path.join(migrationsDir, file),
      !noTransaction,
      fromPos,
      rollback,
      (err) => {
        if (stop) {
          return callback('Stopped');
        }
        callback(err);
      },
    );
    // set pos to 0 for next migration
    fromPos = 0;
  },
  function (err) {
    if (err) {
      console.log(err);
    }
    process.exit(0);
  },
);
