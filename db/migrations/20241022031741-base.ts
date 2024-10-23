import { Migration } from 'sequelize-cli';
import db from '../models';
import { Model, QueryInterface } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

// const tableAttributes: any = [];
const migrationUp = {
  mysql: [
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'Users' AND TABLE_SCHEMA = 'test'",
    'CREATE TABLE IF NOT EXISTS `Users` (`id` CHAR(36) BINARY , `name` VARCHAR(255) NOT NULL, `password` VARCHAR(255) NOT NULL, `email` VARCHAR(255) NOT NULL UNIQUE, `image` VARCHAR(255), `emailVerified` DATETIME, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, `DeletedAt` DATETIME, PRIMARY KEY (`id`)) ENGINE=InnoDB;',
    'SHOW INDEX FROM `Users` FROM `test`',
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'ActionModels' AND TABLE_SCHEMA = 'test'",
    "CREATE TABLE IF NOT EXISTS `ActionModels` (`id` CHAR(36) BINARY  COMMENT 'id', `DbId` CHAR(36) BINARY, `userId` CHAR(36) BINARY, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, `DeletedAt` DATETIME, PRIMARY KEY (`id`)) ENGINE=InnoDB;",
    'SHOW INDEX FROM `ActionModels` FROM `test`',
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'DBs' AND TABLE_SCHEMA = 'test'",
    "CREATE TABLE IF NOT EXISTS `DBs` (`id` CHAR(36) BINARY  COMMENT 'id', `userId` CHAR(36) BINARY, `name` VARCHAR(255) NOT NULL COMMENT '连接名称', `config` JSON NOT NULL COMMENT '配置', `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, `DeletedAt` DATETIME, PRIMARY KEY (`id`)) ENGINE=InnoDB;",
    'SHOW INDEX FROM `DBs` FROM `test`',
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'Schemas' AND TABLE_SCHEMA = 'test'",
    "CREATE TABLE IF NOT EXISTS `Schemas` (`id` CHAR(36) BINARY  COMMENT 'id', `name` VARCHAR(255) NOT NULL COMMENT '模型名称', `graph` JSON NOT NULL COMMENT '模型结构', `userId` CHAR(36) BINARY, `description` VARCHAR(10000) COMMENT '模型描述', `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, `DeletedAt` DATETIME, PRIMARY KEY (`id`)) ENGINE=InnoDB;",
    'SHOW INDEX FROM `Schemas` FROM `test`',
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'DBSchemas' AND TABLE_SCHEMA = 'test'",
    'CREATE TABLE IF NOT EXISTS `DBSchemas` (`DBId` CHAR(36) BINARY , `userId` CHAR(36) BINARY, `SchemaId` CHAR(36) BINARY , `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, `DeletedAt` DATETIME, UNIQUE `DBSchemas_SchemaId_DBId_unique` (`DBId`, `SchemaId`), PRIMARY KEY (`DBId`, `SchemaId`), FOREIGN KEY (`DBId`) REFERENCES `DBs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY (`SchemaId`) REFERENCES `Schemas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE=InnoDB;',
    'SHOW INDEX FROM `DBSchemas` FROM `test`',
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'Workflows' AND TABLE_SCHEMA = 'test'",
    "CREATE TABLE IF NOT EXISTS `Workflows` (`id` CHAR(36) BINARY  COMMENT 'id', `flowJson` JSON, `name` VARCHAR(255) COMMENT '名称', `userId` CHAR(36) BINARY, `DeletedAt` DATETIME, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB;",
    'SHOW INDEX FROM `Workflows` FROM `test`',
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'FlowNodes' AND TABLE_SCHEMA = 'test'",
    "CREATE TABLE IF NOT EXISTS `FlowNodes` (`id` CHAR(36) BINARY  COMMENT 'id', `userId` CHAR(36) BINARY, `type` VARCHAR(255), `data` JSON, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, `DeletedAt` DATETIME, PRIMARY KEY (`id`)) ENGINE=InnoDB;",
    'SHOW INDEX FROM `FlowNodes` FROM `test`',
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'Queries' AND TABLE_SCHEMA = 'test'",
    "CREATE TABLE IF NOT EXISTS `Queries` (`id` CHAR(36) BINARY  COMMENT 'id', `name` VARCHAR(255) NOT NULL COMMENT 'Query名称', `content` JSON NOT NULL COMMENT '内容', `userId` CHAR(36) BINARY, `DbID` CHAR(36) BINARY, `schemaId` CHAR(36) BINARY, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, `DeletedAt` DATETIME, PRIMARY KEY (`id`), FOREIGN KEY (`DbID`) REFERENCES `DBs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY (`schemaId`) REFERENCES `Schemas` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE) ENGINE=InnoDB;",
    'SHOW INDEX FROM `Queries` FROM `test`',
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'SchemaLogs' AND TABLE_SCHEMA = 'test'",
    "CREATE TABLE IF NOT EXISTS `SchemaLogs` (`id` CHAR(36) BINARY  COMMENT 'id', `userId` CHAR(36) BINARY, `schemaId` CHAR(36) BINARY, `name` VARCHAR(255) NOT NULL COMMENT '模型名称', `graph` JSON NOT NULL COMMENT '模型结构', `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, PRIMARY KEY (`id`), FOREIGN KEY (`schemaId`) REFERENCES `Schemas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE=InnoDB;",
    'SHOW INDEX FROM `SchemaLogs` FROM `test`',
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'Widgets' AND TABLE_SCHEMA = 'test'",
    "CREATE TABLE IF NOT EXISTS `Widgets` (`id` CHAR(36) BINARY  COMMENT 'id', `userId` CHAR(36) BINARY, `content` JSON NOT NULL COMMENT '组件内容', `props` JSON NOT NULL COMMENT '组件配置', `name` JSON COMMENT '组件名称', `key` VARCHAR(100) COMMENT '组件识别名称', `author` VARCHAR(1000) COMMENT '作者ID', `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, `DeletedAt` DATETIME, UNIQUE `widget-key` (`key`), PRIMARY KEY (`id`)) ENGINE=InnoDB;",
    'SHOW INDEX FROM `Widgets` FROM `test`',
  ],
};

export const up: Migration['up'] = async function (
  queryInterface: import('sequelize').QueryInterface,
  Sequelize: typeof import('sequelize'),
): Promise<void> {
  // 获取迁移sql
  // await db.sequelize.sync({
  //   alter: true,
  //   logging: (sql) => {
  //     tableAttributes.push(sql.replace('Executing (default): ', ''));
  //     console.log(sql);
  //   },
  // });

  const transaction = await db.sequelize.transaction();
  try {
    const queryInterface = db.sequelize.getQueryInterface();
    console.log(db.sequelize.getDialect());
    // 执行原始 SQL 查询，传入事务选项
    for (const sql of migrationUp[db.sequelize.getDialect()]) {
      const result = await queryInterface.sequelize.query(sql, { transaction });
    }
    // 提交事务
    await transaction.commit();
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    console.error('Error executing transaction:', error);
  }
  // console.log(tableAttributes);
};

export const down: Migration['down'] = async function (
  queryInterface: import('sequelize').QueryInterface,
  Sequelize: typeof import('sequelize'),
): Promise<void> {};
