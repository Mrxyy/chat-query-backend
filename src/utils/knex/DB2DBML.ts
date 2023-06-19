import { Knex as KnexType } from 'knex';

export async function generateDbdiagramDsl(
  knexInstance: KnexType,
): Promise<string> {
  const dbType = knexInstance.client.config.client;
  const isOracle = dbType === 'oracledb';
  const databaseName = isOracle
    ? knexInstance.client.config.connection.user.toUpperCase()
    : knexInstance.client.config.connection.database;

  const tables = isOracle
    ? await knexInstance('all_tables')
        .select('table_name')
        .where('owner', '=', databaseName)
    : await knexInstance('information_schema.tables')
        .select('table_name')
        .where('table_schema', '=', databaseName);

  let dsl = '';

  for (const { TABLE_NAME: table_name } of tables) {
    dsl += `Table ${table_name} {\n`;

    // console.log(databaseName,table_name)
    const columns = isOracle
      ? await knexInstance('all_tab_columns')
          .select('column_name', 'data_type')
          .where('table_name', '=', table_name)
          .andWhere('owner', '=', databaseName)
      : await knexInstance('information_schema.columns')
          .select('column_name', 'data_type', 'column_key')
          .where('table_name', table_name)
          .andWhere('table_schema', databaseName);

    const foreignKeys = isOracle
      ? await knexInstance('all_cons_columns')
          .select('column_name', 'r_constraint_name')
          .where('table_name', '=', table_name)
          .andWhere('owner', '=', databaseName)
          .whereIn('constraint_name', function () {
            this.select('constraint_name')
              .from('all_constraints')
              .where('constraint_type', '=', 'R')
              .andWhere('table_name', '=', table_name)
              .andWhere('owner', '=', databaseName);
          })
      : await knexInstance('information_schema.key_column_usage')
          .select(
            'column_name',
            'referenced_table_name',
            'referenced_column_name',
          )
          .where('table_name', '=', table_name)
          .andWhere('table_schema', '=', databaseName)
          .andWhereRaw('referenced_table_name IS NOT NULL');

    const flag: Record<string, any> = {};
    for (const {
      COLUMN_NAME: column_name,
      REFERENCED_TABLE_NAME: referenced_table_name,
      REFERENCED_COLUMN_NAME: referenced_column_name,
      DATA_TYPE: data_type,
    } of foreignKeys) {
      if (isOracle) {
        const refInfo = await knexInstance('all_constraints')
          .select('table_name', 'column_name')
          .where('constraint_name', '=', referenced_table_name)
          .andWhere('owner', '=', databaseName)
          .first();

        if (refInfo) {
          dsl += `  ${column_name} ${data_type.toUpperCase()} [ref: > ${referenced_table_name}.${referenced_column_name}]\n`;
        }
      } else {
        const columnInfo = columns.find(
          (column) => column.COLUMN_NAME === column_name,
        );
        const data_type = columnInfo ? columnInfo.DATA_TYPE : '';
        // 处理外键关系的代码
        dsl += `  ${column_name} ${data_type.toUpperCase()} [ref: > ${referenced_table_name}.${referenced_column_name}]\n`;
      }
      flag[column_name] = true;
    }

    for (const {
      COLUMN_NAME: column_name,
      DATA_TYPE: data_type,
      COLUMN_KEY: column_key,
    } of columns) {
      if (!flag[column_name])
        dsl += `  ${column_name} ${data_type.toUpperCase()}${
          column_key === 'PRI' ? ' [pk]' : ''
        }\n`;
    }

    // console.log(await knexInstance('information_schema.key_column_usage'), 'foreignKeys');

    dsl += '}\n\n';
  }
  // console.log('generateDbdiagramDsl', dsl);
  return dsl;
}
