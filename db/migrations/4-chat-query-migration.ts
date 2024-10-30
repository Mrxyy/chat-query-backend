
import { QueryInterface, Sequelize, DataTypes } from 'sequelize';
import { Migration } from 'sequelize-cli';
/**
 * Actions summary:
 *
 * createTable "FeatureAiSettings", deps: []
 *
 **/

export const info = {
    "revision": 4,
    "name": "chat-query-migration",
    "created": "2024-10-28T15:30:49.437Z",
    "comment": ""
};

const migrationCommands = (transaction: any) => {
    return [{
        fn: "createTable",
        params: [
            "FeatureAiSettings",
            {
                "id": {
                    "type": DataTypes.UUID,
                    "field": "id",
                    "primaryKey": true,
                    "comment": "ID",
                    "defaultValue": DataTypes.UUIDV4
                },
                "userId": {
                    "type": DataTypes.UUID,
                    "field": "userId",
                    "allowNull": true
                },
                "modelName": {
                    "type": DataTypes.STRING,
                    "field": "modelName",
                    "comment": "名称"
                },
                "featureName": {
                    "type": DataTypes.STRING,
                    "field": "featureName",
                    "comment": "功能名称"
                },
                "config": {
                    "type": DataTypes.JSON,
                    "field": "config",
                    "comment": ""
                },
                "DeletedAt": {
                    "type": DataTypes.DATE,
                    "field": "DeletedAt"
                },
                "createdAt": {
                    "type": DataTypes.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": DataTypes.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                }
            },
            {
                "transaction": transaction
            }
        ]
    }];
};
const rollbackCommands = (transaction: any) => {
    return [{
        fn: "dropTable",
        params: ["FeatureAiSettings", {
            transaction: transaction
        }]
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
