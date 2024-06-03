import { ModelExporter, Parser, exporter } from '@dbml/core';
import { readFileSync, writeFileSync } from 'fs';
/**
 * It takes a table dictionary and a link dictionary and returns a SQL string
 * @param tableDict - a dictionary of tables, where the key is the table ID and the value is the tableobject
 * @param linkDict - a dictionary of links, where the key is the link id and the value is the linkobject
 * @param [databaseType=postgres] - The type of database you want to export to.
 * @returns SQL string.
 */
const exportSQL = (
  tableDict: any,
  linkDict: any,
  databaseType: 'postgres' | 'mysql' | 'dbml' | 'mssql' | 'json' = 'mysql',
) => {
  const combined = {
    name: 'public',
    note: '',
    tables: Object.values(tableDict || {}).map((table: any) => {
      return {
        name: table.name,
        note: table.note,
        fields: table.fields.map((field) => {
          return {
            ...field,
            type: {
              // To lower case because of typing 'BIGINT' with upper case and increment get wrong pg sql type when export
              type_name: field.type.toLowerCase(),
              args: null,
            },
          };
        }),
      };
    }),
    enums: [],
    tableGroups: [],
    refs: Object.values(linkDict || {}).map((ref: any) => {
      return {
        ...ref,
        endpoints: ref.endpoints.map((endpoint) => {
          return {
            ...endpoint,
            tableName: tableDict[endpoint.id].name,
            fieldNames: [
              tableDict[endpoint.id].fields.find(
                (field) => field.id == endpoint.fieldId,
              ).name,
            ],
          };
        }),
      };
    }),
  };

  const database = Parser.parse(combined as any, 'json');
  const dbml = ModelExporter.export(database, 'dbml', false);
  const sql = exporter.export(dbml, databaseType);
  // console.log(sql);
  // writeFileSync('./test.sql', sql);
  return sql.split(/\n\s*\n/);
};

export default exportSQL;