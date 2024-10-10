import { oracleOptions } from './oracle';
import { mssqlOptions } from './mssql';
import { mysqlOptions } from './mysql';
import { postgresOptions } from './postgres';
import { sqliteOptions } from './sqlite';
import { DialectOptions } from './dialect-options';
import { Dialect } from 'sequelize';

export const dialects: { [name: string]: DialectOptions } = {
  mssql: mssqlOptions,
  mysql: mysqlOptions,
  mariadb: mysqlOptions,
  postgres: postgresOptions,
  sqlite: sqliteOptions,
  oracle: oracleOptions,
};
