
import { QueryInterface, Sequelize, DataTypes } from 'sequelize';
import { Migration } from 'sequelize-cli';
/**
 * Actions summary:
 *
 * addColumn "authToken" to table "LLMModels"
 *
 **/

export const info = {
    "revision": 3,
    "name": "chat-query-migration",
    "created": "2024-10-28T09:13:00.311Z",
    "comment": ""
};

const migrationCommands = (transaction: any) => {
    return [{
        fn: "addColumn",
        params: [
            "LLMModels",
            "authToken",
            {
                "type": DataTypes.STRING,
                "field": "authToken",
                "comment": "密钥"
            },
            {
                transaction: transaction
            }
        ]
    }];
};
const rollbackCommands = (transaction: any) => {
    return [{
        fn: "removeColumn",
        params: [
            "LLMModels",
            "authToken",
            {
                transaction: transaction
            }
        ]
    }];
};

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
