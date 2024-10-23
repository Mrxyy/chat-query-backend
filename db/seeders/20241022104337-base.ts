import { Migration } from 'sequelize-cli';
import db from '../models';
import { Model, QueryInterface } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

const tableAttributes: any = [];

export const up: Migration['up'] = async function (
  queryInterface: import('sequelize').QueryInterface,
  Sequelize: typeof import('sequelize'),
): Promise<void> {
  // 获取迁移sql;
  await db.sequelize.sync({
    alter: true,
    logging: (sql) => {
      tableAttributes.push(sql.replace('Executing (default): ', ''));
      console.log(sql);
    },
  });

  console.log(tableAttributes);
};

export const down: Migration['down'] = async function (
  queryInterface: import('sequelize').QueryInterface,
  Sequelize: typeof import('sequelize'),
): Promise<void> {};
