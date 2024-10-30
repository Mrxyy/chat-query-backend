
import { QueryInterface, Sequelize, DataTypes } from 'sequelize';
import { Migration } from 'sequelize-cli';
/**
 * Actions summary:
 *
 * createTable "LLMConfigs", deps: []
 * createTable "LLMModels", deps: [LLMConfigs]
 *
 **/

export const info = {
    "revision": 2,
    "name": "chat-query-migration",
    "created": "2024-10-25T09:40:40.758Z",
    "comment": ""
};

const migrationCommands = (transaction: any) => {
    return [{
            fn: "createTable",
            params: [
                "LLMConfigs",
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
                    "defaultModel": {
                        "type": DataTypes.STRING,
                        "field": "defaultModel",
                        "comment": "默认模型"
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
        },
        {
            fn: "createTable",
            params: [
                "LLMModels",
                {
                    "id": {
                        "type": DataTypes.UUID,
                        "field": "id",
                        "primaryKey": true,
                        "comment": "ID",
                        "defaultValue": DataTypes.UUIDV4
                    },
                    "name": {
                        "type": DataTypes.STRING,
                        "field": "name",
                        "comment": "模型名称"
                    },
                    "userId": {
                        "type": DataTypes.UUID,
                        "field": "userId",
                        "allowNull": true
                    },
                    "baseURL": {
                        "type": DataTypes.STRING,
                        "field": "baseURL",
                        "comment": "基础URL"
                    },
                    "requestModelsPath": {
                        "type": DataTypes.STRING,
                        "field": "requestModelsPath",
                        "comment": "请求模型路径"
                    },
                    "getModelsPathFormResponse": {
                        "type": DataTypes.STRING,
                        "field": "getModelsPathFormResponse",
                        "comment": "从响应中获取模型路径"
                    },
                    "defaultModelsList": {
                        "type": DataTypes.STRING,
                        "field": "defaultModelsList",
                        "comment": "默认模型列表"
                    },
                    "createFunction": {
                        "type": DataTypes.STRING,
                        "field": "createFunction",
                        "comment": "创建功能标识"
                    },
                    "llmConfigId": {
                        "type": DataTypes.UUID,
                        "onUpdate": "CASCADE",
                        "onDelete": "CASCADE",
                        "references": {
                            "model": "LLMConfigs",
                            "key": "id"
                        },
                        "name": "llmConfigId",
                        "allowNull": true,
                        "field": "llmConfigId"
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
        }
    ];
};
const rollbackCommands = (transaction: any) => {
    return [{
            fn: "dropTable",
            params: ["LLMConfigs", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["LLMModels", {
                transaction: transaction
            }]
        }
    ];
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
