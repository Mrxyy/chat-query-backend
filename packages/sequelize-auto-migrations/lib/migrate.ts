import Sequelize, { QueryInterface } from 'sequelize';
import hash from 'object-hash';
import _ from 'lodash';
import { diff } from 'deep-diff';
import { js_beautify } from 'js-beautify';

import * as fs from 'fs';
import * as path from 'path';

interface ColumnOptions {
  binary?: boolean;
  length?: string;
  decimals?: number;
  precision?: number;
  scale?: number;
  zerofill?: boolean;
  unsigned?: boolean;
  values?: string[];
  references?: { model: string; key?: string };
  srid?: number;
  type?: string;
  [key: string]: any;
  toString: (arg?: Sequelize.Sequelize) => string;
}

interface Column {
  type?: {
    key: string;
    options?: ColumnOptions;
    toSql?: () => string;
    toString: (arg?: Sequelize.Sequelize) => string;
  };
  defaultValue?: any;
  seqType?: string;
  [key: string]: any;
}

interface Model {
  tableName: string;
  attributes: { [key: string]: Column };
  rawAttributes?: { [key: string]: Column };
  options: {
    indexes: Record<string, any>;
    charset?: string;
  };
}

interface MigrationAction {
  actionType: string;
  tableName: string;
  attributeName?: string;
  attribute?: string;
  attributes?: any[];
  options?: any;
  fields?: string[];
  depends?: string[];
  columnName?: string;
}

interface Action {
  actionType: string;
  tableName: string;
  attributes?: Record<string, any>;
  options?: Record<string, any>;
  depends?: string[];
  field?: string;
  attributeName?: string;
  columnName?: string;
  fields?: string[];
}

interface MigrationResult {
  commands: string[];
  consoleOut: string[];
}

interface Migration {
  commandsUp: string[];
  commandsDown: string[];
  consoleOut: string[];
}

interface MigrationInfo {
  revision: number;
  name: string;
  created: Date;
  comment: string;
}

const reverseSequelizeColType = (
  col: Column,
  prefix = 'DataTypes.',
): string => {
  const attrName = col['type']!.key;
  const attrObj = col.type;
  const options = col['type']!['options'] || {};
  const DataTypes = Sequelize.DataTypes;

  switch (attrName) {
    case DataTypes.CHAR.key:
      return options.binary
        ? `${prefix}CHAR.BINARY`
        : `${prefix}CHAR(${options.length})`;
    case DataTypes.STRING.key:
      return `${prefix}STRING${options.length ? `(${options.length})` : ''}${
        options.binary ? '.BINARY' : ''
      }`;
    case DataTypes.TEXT.key:
      return options.length
        ? `${prefix}TEXT(${options.length.toLowerCase()})`
        : `${prefix}TEXT`;
    case DataTypes.NUMBER.key:
    case DataTypes.TINYINT.key:
    case DataTypes.SMALLINT.key:
    case DataTypes.MEDIUMINT.key:
    case DataTypes.BIGINT.key:
    case DataTypes.FLOAT.key:
    case DataTypes.REAL.key:
    case DataTypes.DOUBLE.key:
    case DataTypes.DECIMAL.key:
    case DataTypes.INTEGER.key: {
      let ret = attrName;
      if (options.length) {
        ret += `(${options.length}`;
        if (options.decimals) ret += `, ${options.decimals}`;
        ret += ')';
      }
      if (options.precision) {
        ret += `(${options.precision}`;
        if (options.scale) ret += `, ${options.scale}`;
        ret += ')';
      }
      const modifiers: string[] = [];
      if (options.zerofill) modifiers.push('ZEROFILL');
      if (options.unsigned) modifiers.push('UNSIGNED');
      return `${prefix}${[ret, ...modifiers].join('.')}`;
    }
    case DataTypes.ENUM.key:
      return `${prefix}ENUM('${options.values!.join("', '")}')`;
    case DataTypes.BLOB.key:
      return options.length
        ? `${prefix}BLOB(${options.length.toLowerCase()})`
        : `${prefix}BLOB`;
    case DataTypes.GEOMETRY.key:
      return options.type
        ? `${prefix}GEOMETRY('${options.type}'${
            options.srid ? `, ${options.srid}` : ''
          })`
        : `${prefix}GEOMETRY`;
    case DataTypes.GEOGRAPHY.key:
      return `${prefix}GEOGRAPHY`;
    case DataTypes.ARRAY.key:
      const _type = attrObj!.toString();
      return prefix + (_type === 'INTEGER[]' ? 'INTEGER' : 'STRING');
    case DataTypes.RANGE.key:
      console.warn(`${attrName} type not supported, you should make it by`);
      return prefix + (attrObj as any).toSql();
    default:
      return prefix + attrName;
  }
};

const reverseSequelizeDefValueType = (
  defaultValue: any,
  prefix = 'DataTypes.',
) => {
  if (
    typeof defaultValue === 'object' &&
    defaultValue.constructor &&
    defaultValue.constructor.name
  ) {
    return { internal: true, value: prefix + defaultValue.constructor.name };
  }
  if (typeof defaultValue === 'function')
    return { notSupported: true, value: '' };
  return { value: defaultValue };
};

const parseIndex = (idx: any) => {
  delete idx.parser;
  if (idx.type === '') delete idx.type;

  const options: any = {};
  if (idx.name) options.name = options.indexName = idx.name;
  if (idx.unique) options.type = options.indicesType = 'UNIQUE';
  if (idx.method) options.indexType = idx.type;

  idx.options = options;
  idx.hash = hash(idx);
  return idx;
};

const reverseModels = (
  sequelize: Sequelize.Sequelize,
  models: { [key: string]: Model },
) => {
  const tables: { [key: string]: any } = {};
  delete models.default;

  for (const model in models) {
    const attributes = models[model].attributes || models[model].rawAttributes;

    for (const column in attributes) {
      delete attributes[column].Model;
      delete attributes[column].fieldName;

      for (const property in attributes[column]) {
        if (property.startsWith('_')) {
          delete attributes[column][property];
          continue;
        }
        if (property === 'defaultValue') {
          const _val = reverseSequelizeDefValueType(
            attributes[column][property],
          );
          if (_val.notSupported) {
            console.log(
              `[Not supported] Skip defaultValue column of attribute ${model}:${column}`,
            );
            delete attributes[column][property];
            continue;
          }
          attributes[column][property] = _val;
        }
        if (typeof attributes[column][property] === 'function')
          delete attributes[column][property];
      }

      if (typeof attributes[column]['type'] === 'undefined') {
        if (!attributes[column]['seqType']) {
          console.log(
            `[Not supported] Skip column with undefined type ${model}:${column}`,
          );
          delete attributes[column];
          continue;
        } else {
          attributes[column]['type'] = {
            key: Sequelize.ARRAY.key,
          };
        }
      }

      let seqType = reverseSequelizeColType(attributes[column]);
      if (seqType === 'Sequelize.VIRTUAL') {
        console.log(
          `[SKIP] Skip Sequelize.VIRTUAL column "${column}", defined in model "${model}"`,
        );
        delete attributes[column];
        continue;
      }

      if (!seqType) {
        if (attributes[column]['type']?.options?.toString) {
          seqType = attributes[column]['type']['options'].toString(sequelize);
        }
        if (attributes[column]['type']) {
          seqType = attributes[column]['type'].toString(sequelize);
        }
      }

      attributes[column]['seqType'] = seqType;
      delete attributes[column].type;
      delete attributes[column].values; // ENUM
    }

    tables[models[model].tableName] = {
      tableName: models[model].tableName,
      schema: attributes,
    };

    if (models[model].options.indexes.length > 0) {
      const idx_out: { [key: string]: any } = {};
      for (const _i in models[model].options.indexes) {
        const index = parseIndex(models[model].options.indexes[_i]);
        idx_out[index.hash + ''] = index;
        delete index.hash;
        Object.freeze(index);
      }
      models[model].options.indexes = idx_out;
    }

    if (models[model].options.charset) {
      tables[models[model].tableName].charset = models[model].options.charset;
    }

    tables[models[model].tableName].indexes = models[model].options.indexes;
  }

  return tables;
};

const parseDifference = (previousState: any, currentState: any) => {
  const actions: MigrationAction[] = [];
  const difference = diff(previousState, currentState);

  for (const _d in difference) {
    const df = difference[_d];
    switch (df.kind) {
      case 'N':
        {
          if (df.path.length === 1) {
            const depends: string[] = [];
            const tableName = df.rhs.tableName;
            _.each(df.rhs.schema, (v) => {
              if (v.references) depends.push(v.references.model);
            });

            const options: any = {};
            if (df.rhs.charset) {
              options.charset = df.rhs.charset;
            }

            actions.push({
              actionType: 'createTable',
              tableName: tableName,
              attributes: df.rhs.schema,
              options: options,
              depends: depends,
            });

            if (df.rhs.indexes) {
              for (const _i in df.rhs.indexes) {
                actions.push(
                  _.extend(
                    {
                      actionType: 'addIndex',
                      tableName: tableName,
                      depends: [tableName],
                    },
                    _.clone(df.rhs.indexes[_i]),
                  ),
                );
              }
            }
            break;
          }

          const tableName = df.path[0];
          const depends = [tableName];

          if (df.path[1] === 'schema') {
            if (df.path.length === 3) {
              if (df.rhs && df.rhs.references)
                depends.push(df.rhs.references.model);
              actions.push({
                actionType: 'addColumn',
                tableName: tableName,
                attributeName: df.path[2],
                options: df.rhs,
                depends: depends,
              });
              break;
            }

            if (df.path.length > 3) {
              const options = currentState[tableName].schema[df.path[2]];
              if (options.references) depends.push(options.references.model);
              actions.push({
                actionType: 'changeColumn',
                tableName: tableName,
                attributeName: df.path[2],
                options: options,
                depends: depends,
              });
              break;
            }
          }

          if (df.path[1] === 'indexes') {
            const tableName = df.path[0];
            const index = _.clone(df.rhs);
            index.actionType = 'addIndex';
            index.tableName = tableName;
            index.depends = [tableName];
            actions.push(index);
            break;
          }
        }
        break;

      case 'D':
        {
          const tableName = df.path[0];
          const depends = [tableName];

          if (df.path.length === 1) {
            actions.push({
              actionType: 'dropTable',
              tableName: tableName,
              depends: [],
            });
            break;
          }

          if (df.path[1] === 'schema') {
            if (df.path.length === 3) {
              actions.push({
                actionType: 'removeColumn',
                tableName: tableName,
                columnName: df.path[2],
                depends: [tableName],
                options: df.lhs,
              });
              break;
            }

            if (df.path.length > 3) {
              const options = currentState[tableName].schema[df.path[2]];
              if (options.references) depends.push(options.references.model);
              actions.push({
                actionType: 'changeColumn',
                tableName: tableName,
                attributeName: df.path[2],
                options: options,
                depends: depends,
              });
              break;
            }
          }

          if (df.path[1] === 'indexes') {
            actions.push({
              actionType: 'removeIndex',
              tableName: tableName,
              fields: df.lhs.fields,
              options: df.lhs.options,
              depends: [tableName],
            });
            break;
          }
        }
        break;

      case 'E':
        {
          const tableName = df.path[0];
          const depends = [tableName];

          if (df.path[1] === 'schema') {
            const options = currentState[tableName].schema[df.path[2]];
            if (options.references) depends.push(options.references.model);
            actions.push({
              actionType: 'changeColumn',
              tableName: tableName,
              attributeName: df.path[2],
              options: options,
              depends: depends,
            });
          }

          if (df.path[1] === 'indexes') {
            const tableName = df.path[0];
            const keys = Object.keys(df.rhs);

            for (const k in keys) {
              const key = keys[k];
              const index = _.clone(df.rhs[key]);
              actions.push({
                actionType: 'addIndex',
                tableName: tableName,
                fields: df.rhs[key].fields,
                options: df.rhs[key].options,
                depends: [tableName],
              });
              break;
            }

            const keysLhs = Object.keys(df.lhs);
            for (const k in keysLhs) {
              const key = keysLhs[k];
              const index = _.clone(df.lhs[key]);
              actions.push({
                actionType: 'removeIndex',
                tableName: tableName,
                fields: df.lhs[key].fields,
                options: df.lhs[key].options,
                depends: [tableName],
              });
              break;
            }
          }
        }
        break;

      case 'A':
        console.log(
          '[Not supported] Array model changes! Problems are possible. Please, check result more carefully!',
        );
        console.log('[Not supported] Difference: ');
        console.log(JSON.stringify(df, null, 4));
        break;

      default:
        break;
    }
  }
  return actions;
};

const sortActions = (actions: MigrationAction[]) => {
  const orderedActionTypes = [
    'removeIndex',
    'removeColumn',
    'dropTable',
    'createTable',
    'addColumn',
    'changeColumn',
    'addIndex',
  ];

  actions.sort((a, b) => {
    const indexA = orderedActionTypes.indexOf(a.actionType);
    const indexB = orderedActionTypes.indexOf(b.actionType);
    if (indexA < indexB) return -1;
    if (indexA > indexB) return 1;

    if (a.depends!.length === 0 && b.depends!.length > 0) return -1;
    if (b.depends!.length === 0 && a.depends!.length > 0) return 1;

    return 0;
  });

  for (let k = 0; k <= actions.length; k++) {
    for (let i = 0; i < actions.length; i++) {
      if (!actions[i].depends || actions[i].depends!.length === 0) continue;

      const a = actions[i];

      for (let j = 0; j < actions.length; j++) {
        if (!actions[j].depends || actions[j].depends!.length === 0) continue;

        const b = actions[j];

        if (a.actionType !== b.actionType) continue;

        if (b.depends!.indexOf(a.tableName) !== -1 && i > j) {
          const c = actions[i];
          actions[i] = actions[j];
          actions[j] = c;
        }
      }
    }
  }
};

const getMigration = function (
  upActions: MigrationAction[],
  downActions: MigrationAction[],
) {
  let { commands: commandsUp, consoleOut } = getPartialMigration(upActions);
  let { commands: commandsDown } = getPartialMigration(downActions);
  return { commandsUp, commandsDown, consoleOut };
};

const getPartialMigration = function (actions: Action[]): MigrationResult {
  const propertyToStr = (obj: Record<string, any>): string => {
    const vals: string[] = [];
    for (const k in obj) {
      if (k === 'seqType') {
        vals.push(`"type": ${obj[k]}`);
        continue;
      }

      if (k === 'defaultValue') {
        if (obj[k].internal) {
          vals.push(`"defaultValue": ${obj[k].value}`);
          continue;
        }
        if (obj[k].notSupported) continue;

        const x = { [k]: obj[k].value };
        vals.push(JSON.stringify(x).slice(1, -1));
        continue;
      }

      const x = { [k]: obj[k] };
      vals.push(JSON.stringify(x).slice(1, -1));
    }

    return '{ ' + vals.reverse().join(', ') + ' }';
  };

  const getAttributes = (attrs: Record<string, any>): string => {
    const ret: string[] = [];
    for (const attrName in attrs) {
      ret.push(`      "${attrName}": ${propertyToStr(attrs[attrName])}`);
    }
    return ' { \n' + ret.join(', \n') + '\n     }';
  };

  const addTransactionToOptions = (options: Record<string, any>): string => {
    let ret = JSON.stringify({ ...options, transaction: '###TRANSACTION###' });
    ret = ret.replace('"###TRANSACTION###"', 'transaction');
    return ret;
  };

  const commands: string[] = [];
  const consoleOut: string[] = [];

  for (const action of actions) {
    switch (action.actionType) {
      case 'createTable': {
        const resUp = `{ fn: "createTable", params: [
    "${action.tableName}",
    ${getAttributes(action.attributes || {})},
    ${addTransactionToOptions(action.options || {})}
] }`;
        commands.push(resUp);
        consoleOut.push(
          `createTable "${action.tableName}", deps: [${action.depends?.join(
            ', ',
          )}]`,
        );
        break;
      }

      case 'dropTable': {
        const res = `{ fn: "dropTable", params: ["${action.tableName}", {transaction: transaction}] }`;
        commands.push(res);
        consoleOut.push(`dropTable "${action.tableName}"`);
        break;
      }

      case 'addColumn': {
        const resUp = `{ fn: "addColumn", params: [
    "${action.tableName}",
    "${
      action.options && action.options.field
        ? action.options.field
        : action.attributeName
    }",
    ${propertyToStr(action.options || {})},
    {transaction: transaction}
] }`;
        commands.push(resUp);
        consoleOut.push(
          `addColumn "${action.attributeName}" to table "${action.tableName}"`,
        );
        break;
      }

      case 'removeColumn': {
        const res = `{ fn: "removeColumn", params: [
    "${action.tableName}",
    "${
      action.options && action.options.field
        ? action.options.field
        : action.columnName
    }",
    {transaction: transaction}
  ]
}`;
        commands.push(res);
        consoleOut.push(
          `removeColumn "${
            action.options && action.options.field
              ? action.options.field
              : action.columnName
          }" from table "${action.tableName}"`,
        );
        break;
      }

      case 'changeColumn': {
        const res = `{ fn: "changeColumn", params: [
    "${action.tableName}",
    "${
      action.options && action.options.field
        ? action.options.field
        : action.attributeName
    }",
    ${propertyToStr(action.options || {})},
    {transaction: transaction}
] }`;
        commands.push(res);
        consoleOut.push(
          `changeColumn "${action.attributeName}" on table "${action.tableName}"`,
        );
        break;
      }

      case 'addIndex': {
        const res = `{ fn: "addIndex", params: [
    "${action.tableName}",
    ${JSON.stringify(action.fields)},
    ${addTransactionToOptions(action.options || {})}
] }`;
        commands.push(res);
        const nameOrAttrs =
          action.options &&
          action.options.indexName &&
          action.options.indexName !== ''
            ? `"${action.options.indexName}"`
            : JSON.stringify(action.fields);
        consoleOut.push(
          `addIndex ${nameOrAttrs} to table "${action.tableName}"`,
        );
        break;
      }

      case 'removeIndex': {
        const nameOrAttrs =
          action.options &&
          action.options.indexName &&
          action.options.indexName !== ''
            ? `"${action.options.indexName}"`
            : JSON.stringify(action.fields);
        const res = `{ fn: "removeIndex", params: [
    "${action.tableName}",
    ${nameOrAttrs},
    {transaction: transaction}
] }`;
        commands.push(res);
        consoleOut.push(
          `removeIndex ${nameOrAttrs} from table "${action.tableName}"`,
        );
        break;
      }

      default:
      // Handle unsupported action types if necessary
    }
  }

  return { commands, consoleOut };
};

const writeMigration = function (
  revision: number,
  migration: Migration,
  migrationsDir: string,
  name: string = '',
  comment: string = '',
): { filename: string; info: MigrationInfo } {
  let _commandsUp = `const migrationCommands = (transaction: any) => { return [ \n${migration.commandsUp.join(
    ', \n',
  )}\n]; };\n`;
  let _commandsDown = `const rollbackCommands = (transaction: any) => { return [ \n${migration.commandsDown.join(
    ', \n',
  )}\n]; };\n`;
  let _actions = ' * ' + migration.consoleOut.join('\n * ');

  _commandsUp = js_beautify(_commandsUp);
  _commandsDown = js_beautify(_commandsDown);

  const info: MigrationInfo = {
    revision,
    name,
    created: new Date(),
    comment,
  };

  const template = `
import { QueryInterface, Sequelize, DataTypes } from 'sequelize';
import { Migration } from 'sequelize-cli';
/**
 * Actions summary:
 *
${_actions}
 *
 **/

export const info = ${JSON.stringify(info, null, 4)};

${_commandsUp}
${_commandsDown}

export const pos = 0;

export const useTransaction = true;

export function execute(queryInterface: QueryInterface, Sequelize: typeof import('sequelize'), _commands: (transaction: any) => any[]) {
        let index = this.pos;
        const run = (transaction: any) => {
            const commands = _commands(transaction);
            return new Promise((resolve, reject) => {
                const next = () => {
                    if (index < commands.length) {
                        const command = commands[index];
                        console.log("[#"+index+"] execute: " + command.fn);
                        index++;
                        queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                    } else {
                        resolve(null);
                    }
                };
                next();
            });
        };
        if (this.useTransaction) {
            return queryInterface.sequelize.transaction(run);
        } else {
            return run(null);
        }
    }

export const up: Migration['up'] = async function (
  queryInterface: import('sequelize').QueryInterface,
  Sequelize: typeof import('sequelize'),
): Promise<void> {
  return this.execute(queryInterface, Sequelize, migrationCommands);
};

export const down: Migration['down'] = async function (
  queryInterface: import('sequelize').QueryInterface,
  Sequelize: typeof import('sequelize'),
): Promise<void> {
  return this.execute(queryInterface, Sequelize, rollbackCommands);
};
`;
  name = name.replace(' ', '_');
  const filename = path.join(
    migrationsDir,
    `${revision}${name ? `-${name}` : ''}.ts`,
  );

  fs.writeFileSync(filename, template);

  return { filename, info };
};

const writeMigrationJS = function (
  revision: number,
  migration: Migration,
  migrationsDir: string,
  name: string = '',
  comment: string = '',
): { filename: string; info: MigrationInfo } {
  let _commandsUp = `var migrationCommands = function(transaction) {return [ \n${migration.commandsUp.join(
    ', \n',
  )}\n];};\n`;
  let _commandsDown = `var rollbackCommands = function(transaction) {return [ \n${migration.commandsDown.join(
    ', \n',
  )}\n];};\n`;
  let _actions = ' * ' + migration.consoleOut.join('\n * ');

  _commandsUp = js_beautify(_commandsUp);
  _commandsDown = js_beautify(_commandsDown);

  const info: MigrationInfo = {
    revision,
    name,
    created: new Date(),
    comment,
  };

  const template = `'use strict';

var Sequelize = require('sequelize');
const { DataTypes } = Sequelize;

/**
 * Actions summary:
 *
${_actions}
 *
 **/

var info = ${JSON.stringify(info, null, 4)};

${_commandsUp}
${_commandsDown}

module.exports = {
    pos: 0,
    useTransaction: true,
    execute: function(queryInterface, Sequelize, _commands) {
        var index = this.pos;
        function run(transaction) {
            const commands = _commands(transaction);
            return new Promise(function(resolve, reject) {
                function next() {
                    if (index < commands.length) {
                        let command = commands[index];
                        console.log("[#"+index+"] execute: " + command.fn);
                        index++;
                        queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                    } else {
                        resolve();
                    }
                }
                next();
            });
        }
        if (this.useTransaction) {
            return queryInterface.sequelize.transaction(run);
        } else {
            return run(null);
        }
    },
    up: function(queryInterface, Sequelize) {
        return this.execute(queryInterface, Sequelize, migrationCommands);
    },
    down: function(queryInterface, Sequelize) {
        return this.execute(queryInterface, Sequelize, rollbackCommands);
    },
    info: info
};
`;

  name = name.replace(' ', '_');
  const filename = path.join(
    migrationsDir,
    `${revision}${name ? `-${name}` : ''}.js`,
  );

  fs.writeFileSync(filename, template);

  return { filename, info };
};

const executeMigration = function (
  queryInterface: QueryInterface,
  filename: string,
  useTransaction: boolean,
  pos: number,
  rollback: number | false,
  cb: (err?: string) => void,
) {
  const mig = require(filename);

  if (!mig) {
    return cb(`Can't require file ${filename}`);
  }

  if (pos > 0) {
    console.log(`Set position to ${pos}`);
    mig.pos = pos;
  }
  mig.useTransaction = useTransaction;

  if (typeof rollback === 'number') {
    if (typeof mig.down !== 'function') {
      return cb('No rollback command');
    }
    mig.down(queryInterface, Sequelize).then(
      () => {
        cb();
      },
      (err: any) => {
        cb(err);
      },
    );
  } else {
    mig.up(queryInterface, Sequelize).then(
      () => {
        cb();
      },
      (err: any) => {
        cb(err);
      },
    );
  }
};

export default {
  writeMigration,
  writeMigrationJS,
  getMigration,
  sortActions,
  parseDifference,
  reverseModels,
  executeMigration,
};
