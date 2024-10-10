import _ from 'lodash';
import { addTicks, DialectOptions, FKRow, makeCondition } from './dialect-options';

export const oracleOptions: DialectOptions = {
  name: 'oracle',
  hasSchema: true, // Oracle 使用 Schema
  /**
   * 生成一个 SQL 查询，返回一个表的所有外键。
   *
   * @param  {String} tableName  表名。
   * @param  {String} schemaName 模式名。
   * @return {String}            生成的 SQL 查询。
   */
  showTablesQuery() {
    return `SELECT
    table_name,
    0 as lvl
FROM
    user_tables
WHERE
    table_name NOT LIKE 'APEX_%'
AND
    table_name NOT LIKE 'WWV_%';
`;
  },

  getForeignKeysQuery: (tableName: string, schemaName: string) => {
    return `SELECT
      a.constraint_name,
      a.owner as source_schema,
      a.table_name as source_table,
      b.column_name as source_column,
      c.owner as target_schema,
      c_pk.table_name as target_table,
      b.column_name as target_column
    FROM
      all_cons_columns b
    JOIN
      all_constraints a ON b.owner = a.owner AND b.constraint_name = a.constraint_name
    JOIN
      all_constraints c ON a.r_owner = c.owner AND a.r_constraint_name = c.constraint_name
    JOIN
      all_cons_columns c_pk ON c.owner = c_pk.owner AND c.constraint_name = c_pk.constraint_name
    WHERE
      a.constraint_type = 'R' AND
      a.table_name = ${addTicks(tableName)} AND
      a.owner = ${addTicks(schemaName)}`;
  },

  /**
   * 生成一个 SQL 查询，用于判断表是否有触发器。
   *
   * @param  {String} tableName  表名。
   * @param  {String} schemaName 模式名。
   * @return {String}            生成的 SQL 查询。
   */
  countTriggerQuery: (tableName: string, schemaName: string) => {
    return `SELECT COUNT(*) AS trigger_count
            FROM all_triggers
            WHERE table_name = ${addTicks(tableName)}
            AND table_owner = ${addTicks(schemaName)}`;
  },

  /**
   * 判断 getForeignKeysQuery 结果中的记录是否为外键。
   *
   * @param {Object} record getForeignKeysQuery 的行记录。
   * @return {Bool}
   */
  isForeignKey: (record: FKRow) => {
    return _.isObject(record) && _.has(record, 'constraint_type') && record.constraint_type === 'R';
  },

  /**
   * 判断 getForeignKeysQuery 结果中的记录是否为唯一键。
   *
   * @param {Object} record getForeignKeysQuery 的行记录。
   * @return {Bool}
   */
  isUnique: (record: FKRow, records: FKRow[]) => {
    return records.some((row) => row.constraint_name === record.constraint_name && row.constraint_type === 'U');
  },

  /**
   * 判断 getForeignKeysQuery 结果中的记录是否为主键。
   *
   * @param {Object} record getForeignKeysQuery 的行记录。
   * @return {Bool}
   */
  isPrimaryKey: (record: FKRow) => {
    return _.isObject(record) && _.has(record, 'constraint_type') && record.constraint_type === 'P';
  },

  /**
   * 判断 getForeignKeysQuery 结果中的记录是否为自增键。
   * 由于 Oracle 11g 不支持自增列，我们需要检查是否存在用于该列的自增触发器。
   *
   * @param {Object} record getForeignKeysQuery 的行记录。
   * @param {String} schemaName 模式名。
   * @return {Bool}
   */
  isSerialKey: (record: FKRow) => {
    return _.isObject(record) && _.has(record, 'is_identity') && record.is_identity;
  },

  /**
   * 生成一个 SQL 查询，用于显示数据库中的视图。
   *
   * @param {String} dbName 数据库名。
   * @return {String}       生成的 SQL 查询。
   */
  showViewsQuery: (dbName?: string) => {
    return `SELECT VIEW_NAME as table_name FROM all_views WHERE owner = '${dbName}'`;
  },
};
