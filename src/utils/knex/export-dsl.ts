import { ModelExporter, Parser } from '@dbml/core';
/**
 * It takes a table dictionary and a link dictionary and returns a SQL string
 * @param tableDict - a dictionary of tables, where the key is the table ID and the value is the tableobject
 * @param linkDict - a dictionary of links, where the key is the link id and the value is the linkobject
 * @param [databaseType=postgres] - The type of database you want to export to.
 * @returns dbml string.
 */
const exportDsl = (
  tableDict: any,
  linkDict: any,
  databaseType: 'postgres' | 'mysql' | 'dbml' | 'mssql' | 'json' = 'mysql',
) => {
  const combined = {
    name: 'public',
    note: '',
    tables: Object.values(tableDict || {}).map((table: any) => {
      return {
        ...table,
        name: table.name,
        note: table.note,
        fields: table.fields.map((field) => {
          return {
            ...field,
            dbdefault: !field.dbdefault
              ? undefined
              : {
                  type: field.dbdefaultType,
                  value: field.dbdefault,
                },
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
            tableName: tableDict[endpoint.table].name,
            fieldNames: [
              tableDict[endpoint.table].fields.find(
                (field) => field.id == endpoint.fieldId,
              ).name,
            ],
          };
        }),
      };
    }),
  };

  const database = new Parser(undefined).parse(combined as any, 'json');
  const dbml = ModelExporter.export(database, databaseType, false);
  return dbml;
};

export default exportDsl;
