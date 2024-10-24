
import { QueryInterface, Sequelize, DataTypes } from 'sequelize';
import { Migration } from 'sequelize-cli';
/**
 * Actions summary:
 *
 * createTable "Users", deps: []
 * createTable "ActionModels", deps: []
 * createTable "DBs", deps: []
 * createTable "Workflows", deps: []
 * createTable "FlowNodes", deps: []
 * createTable "Schemas", deps: []
 * createTable "Widgets", deps: []
 * createTable "DBSchemas", deps: [DBs, Schemas]
 * createTable "Queries", deps: [DBs, Schemas]
 * createTable "SchemaLogs", deps: [Schemas]
 *
 **/

export const info = {
    "revision": 1,
    "name": "chat-query-migration",
    "created": "2024-10-24T01:58:05.965Z",
    "comment": ""
};

const migrationCommands = (transaction: any) => {
    return [{
            fn: "createTable",
            params: [
                "Users",
                {
                    "id": {
                        "type": DataTypes.UUID,
                        "field": "id",
                        "primaryKey": true,
                        "defaultValue": DataTypes.UUIDV4
                    },
                    "name": {
                        "type": DataTypes.STRING,
                        "field": "name",
                        "allowNull": false
                    },
                    "password": {
                        "type": DataTypes.STRING,
                        "field": "password",
                        "allowNull": false
                    },
                    "email": {
                        "type": DataTypes.STRING,
                        "field": "email",
                        "unique": true,
                        "allowNull": false
                    },
                    "image": {
                        "type": DataTypes.STRING,
                        "field": "image",
                        "allowNull": true
                    },
                    "emailVerified": {
                        "type": DataTypes.DATE,
                        "field": "emailVerified"
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
                    },
                    "DeletedAt": {
                        "type": DataTypes.DATE,
                        "field": "DeletedAt"
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
                "ActionModels",
                {
                    "id": {
                        "type": DataTypes.UUID,
                        "field": "id",
                        "primaryKey": true,
                        "comment": "id",
                        "defaultValue": DataTypes.UUIDV4
                    },
                    "DbId": {
                        "type": DataTypes.UUID,
                        "field": "DbId"
                    },
                    "userId": {
                        "type": DataTypes.UUID,
                        "field": "userId",
                        "allowNull": true
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
                    },
                    "DeletedAt": {
                        "type": DataTypes.DATE,
                        "field": "DeletedAt"
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
                "DBs",
                {
                    "id": {
                        "type": DataTypes.UUID,
                        "field": "id",
                        "primaryKey": true,
                        "comment": "id",
                        "defaultValue": DataTypes.UUIDV4
                    },
                    "userId": {
                        "type": DataTypes.UUID,
                        "field": "userId",
                        "allowNull": true
                    },
                    "name": {
                        "type": DataTypes.STRING,
                        "field": "name",
                        "comment": "连接名称",
                        "allowNull": false
                    },
                    "config": {
                        "type": DataTypes.JSON,
                        "field": "config",
                        "comment": "配置",
                        "allowNull": false
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
                    },
                    "DeletedAt": {
                        "type": DataTypes.DATE,
                        "field": "DeletedAt"
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
                "Workflows",
                {
                    "id": {
                        "type": DataTypes.UUID,
                        "field": "id",
                        "primaryKey": true,
                        "comment": "id",
                        "defaultValue": DataTypes.UUIDV4
                    },
                    "flowJson": {
                        "type": DataTypes.JSON,
                        "field": "flowJson",
                        "defaultValue": "{}"
                    },
                    "name": {
                        "type": DataTypes.STRING,
                        "field": "name",
                        "comment": "名称",
                        "allowNull": true
                    },
                    "userId": {
                        "type": DataTypes.UUID,
                        "field": "userId",
                        "allowNull": true
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
                "FlowNodes",
                {
                    "id": {
                        "type": DataTypes.UUID,
                        "field": "id",
                        "primaryKey": true,
                        "comment": "id",
                        "defaultValue": DataTypes.UUIDV4
                    },
                    "userId": {
                        "type": DataTypes.UUID,
                        "field": "userId",
                        "allowNull": true
                    },
                    "type": {
                        "type": DataTypes.STRING,
                        "field": "type"
                    },
                    "data": {
                        "type": DataTypes.JSON,
                        "field": "data"
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
                    },
                    "DeletedAt": {
                        "type": DataTypes.DATE,
                        "field": "DeletedAt"
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
                "Schemas",
                {
                    "id": {
                        "type": DataTypes.UUID,
                        "field": "id",
                        "primaryKey": true,
                        "comment": "id",
                        "defaultValue": DataTypes.UUIDV4
                    },
                    "name": {
                        "type": DataTypes.STRING,
                        "field": "name",
                        "comment": "模型名称",
                        "allowNull": false
                    },
                    "graph": {
                        "type": DataTypes.JSON,
                        "field": "graph",
                        "comment": "模型结构",
                        "allowNull": false
                    },
                    "userId": {
                        "type": DataTypes.UUID,
                        "field": "userId",
                        "allowNull": true
                    },
                    "description": {
                        "type": DataTypes.STRING(10000),
                        "field": "description",
                        "comment": "模型描述",
                        "allowNull": true
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
                    },
                    "DeletedAt": {
                        "type": DataTypes.DATE,
                        "field": "DeletedAt"
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
                "Widgets",
                {
                    "id": {
                        "type": DataTypes.UUID,
                        "field": "id",
                        "primaryKey": true,
                        "comment": "id",
                        "defaultValue": DataTypes.UUIDV4
                    },
                    "userId": {
                        "type": DataTypes.UUID,
                        "field": "userId",
                        "allowNull": true
                    },
                    "content": {
                        "type": DataTypes.JSON,
                        "field": "content",
                        "comment": "组件内容",
                        "allowNull": false
                    },
                    "props": {
                        "type": DataTypes.JSON,
                        "field": "props",
                        "comment": "组件配置",
                        "allowNull": false
                    },
                    "name": {
                        "type": DataTypes.JSON,
                        "field": "name",
                        "comment": "组件名称"
                    },
                    "key": {
                        "type": DataTypes.STRING(100),
                        "field": "key",
                        "unique": "widget-key",
                        "comment": "组件识别名称"
                    },
                    "author": {
                        "type": DataTypes.STRING(1000),
                        "field": "author",
                        "comment": "作者ID",
                        "allowNull": true
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
                    },
                    "DeletedAt": {
                        "type": DataTypes.DATE,
                        "field": "DeletedAt"
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
                "DBSchemas",
                {
                    "DBId": {
                        "type": DataTypes.UUID,
                        "unique": "DBSchemas_SchemaId_DBId_unique",
                        "onUpdate": "CASCADE",
                        "onDelete": "CASCADE",
                        "references": {
                            "model": "DBs",
                            "key": "id"
                        },
                        "primaryKey": true,
                        "name": "DBId",
                        "field": "DBId"
                    },
                    "userId": {
                        "type": DataTypes.UUID,
                        "field": "userId",
                        "allowNull": true
                    },
                    "SchemaId": {
                        "type": DataTypes.UUID,
                        "unique": "DBSchemas_SchemaId_DBId_unique",
                        "onUpdate": "CASCADE",
                        "onDelete": "CASCADE",
                        "references": {
                            "model": "Schemas",
                            "key": "id"
                        },
                        "primaryKey": true,
                        "name": "SchemaId",
                        "field": "SchemaId"
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
                    },
                    "DeletedAt": {
                        "type": DataTypes.DATE,
                        "field": "DeletedAt"
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
                "Queries",
                {
                    "id": {
                        "type": DataTypes.UUID,
                        "field": "id",
                        "primaryKey": true,
                        "comment": "id",
                        "defaultValue": DataTypes.UUIDV4
                    },
                    "name": {
                        "type": DataTypes.STRING,
                        "field": "name",
                        "comment": "Query名称",
                        "allowNull": false
                    },
                    "content": {
                        "type": DataTypes.JSON,
                        "field": "content",
                        "comment": "内容",
                        "allowNull": false
                    },
                    "userId": {
                        "type": DataTypes.UUID,
                        "field": "userId",
                        "allowNull": true
                    },
                    "DbID": {
                        "type": DataTypes.UUID,
                        "onUpdate": "CASCADE",
                        "onDelete": "CASCADE",
                        "references": {
                            "model": "DBs",
                            "key": "id"
                        },
                        "name": "DbID",
                        "allowNull": true,
                        "field": "DbID"
                    },
                    "schemaId": {
                        "type": DataTypes.UUID,
                        "onUpdate": "CASCADE",
                        "onDelete": "NO ACTION",
                        "references": {
                            "model": "Schemas",
                            "key": "id"
                        },
                        "name": "schemaId",
                        "allowNull": true,
                        "field": "schemaId"
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
                    },
                    "DeletedAt": {
                        "type": DataTypes.DATE,
                        "field": "DeletedAt"
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
                "SchemaLogs",
                {
                    "id": {
                        "type": DataTypes.UUID,
                        "field": "id",
                        "primaryKey": true,
                        "comment": "id",
                        "defaultValue": DataTypes.UUIDV4
                    },
                    "userId": {
                        "type": DataTypes.UUID,
                        "field": "userId",
                        "allowNull": true
                    },
                    "schemaId": {
                        "type": DataTypes.UUID,
                        "onUpdate": "CASCADE",
                        "onDelete": "CASCADE",
                        "references": {
                            "model": "Schemas",
                            "key": "id"
                        },
                        "name": "schemaId",
                        "allowNull": true,
                        "field": "schemaId"
                    },
                    "name": {
                        "type": DataTypes.STRING,
                        "field": "name",
                        "comment": "模型名称",
                        "allowNull": false
                    },
                    "graph": {
                        "type": DataTypes.JSON,
                        "field": "graph",
                        "comment": "模型结构",
                        "allowNull": false
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
            params: ["Users", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["ActionModels", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["DBSchemas", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["DBs", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["Workflows", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["FlowNodes", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["Queries", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["Schemas", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["SchemaLogs", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["Widgets", {
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
