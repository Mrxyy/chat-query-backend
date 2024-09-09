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
import { dBTypes } from 'src/models/Querys/DBTypes';

export function getBatchSqlItems(sql: string, type: dBTypes) {
  let options;
  switch (type) {
    case 'mysql':
      options = mysqlSplitterOptions;
      break;
    case 'mssql':
      options = mssqlSplitterOptions;
      break;
    case 'postgre':
      options = postgreSplitterOptions;
      break;
    case 'sqlite':
      options = sqliteSplitterOptions;
      break;
    case 'mongo':
      options = mongoSplitterOptions;
      break;
    case 'redis':
      options = redisSplitterOptions;
      break;
    case 'oracle':
      options = oracleSplitterOptions;
      break;
    default:
      throw new Error(`Unsupported database type: ${type}`);
  }
  return splitQuery(sql, options);
}
