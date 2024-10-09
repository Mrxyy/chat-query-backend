import {
  mysqlSplitterOptions,
  mssqlSplitterOptions,
  postgreSplitterOptions,
  sqliteSplitterOptions,
  mongoSplitterOptions,
  redisSplitterOptions,
  oracleSplitterOptions,
  splitQuery,
} from 'dbgate-query-splitter';
import { DBTypes } from '../../models/Database/DBTypes';

export function getBatchSqlItems(sql: string, type: DBTypes) {
  let options;
  switch (type) {
    case DBTypes.MySQL:
      options = mysqlSplitterOptions;
      break;
    case DBTypes.MSSQL:
      options = mssqlSplitterOptions;
      break;
    case DBTypes.Postgre:
      options = postgreSplitterOptions;
      break;
    case DBTypes.SQLite:
      options = sqliteSplitterOptions;
      break;
    case DBTypes.Mongo:
      options = mongoSplitterOptions;
      break;
    case DBTypes.Redis:
      options = redisSplitterOptions;
      break;
    case DBTypes.Oracle:
      options = oracleSplitterOptions;
      break;
    default:
      throw new Error(`Unsupported database type: ${type}`);
  }
  return splitQuery(sql, options);
}
