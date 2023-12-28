import { forEach } from 'lodash';
import exportDsl from '../../src/utils/knex/export-dsl';
describe('dbmlExportSql', () => {
  const json = {};
  forEach(
    {
      mysql:
        "CREATE TABLE `posts` (\n  `id` integer PRIMARY KEY,\n  `title` varchar(255),\n  `body` text DEFAULT 'direct' COMMENT 'Content of the post',\n  `user_id` integer,\n  `status` varchar(255),\n  `created_at` timestamp\n);\n",
      json: '{\n  "schemas": [\n    {\n      "name": "public",\n      "note": "Default Public Schema",\n      "tables": [\n        {\n          "name": "posts",\n          "alias": null,\n          "note": null,\n          "fields": [\n            {\n              "name": "id",\n              "type": {\n                "type_name": "integer",\n                "args": null\n              },\n              "pk": true,\n              "note": null\n            },\n            {\n              "name": "title",\n              "type": {\n                "type_name": "varchar",\n                "args": null\n              },\n              "note": null\n            },\n            {\n              "name": "body",\n              "type": {\n                "type_name": "text",\n                "args": null\n              },\n              "note": "Content of the post",\n              "dbdefault": {\n                "type": "string",\n                "value": "direct"\n              }\n            },\n            {\n              "name": "user_id",\n              "type": {\n                "type_name": "integer",\n                "args": null\n              },\n              "note": null\n            },\n            {\n              "name": "status",\n              "type": {\n                "type_name": "varchar",\n                "args": null\n              },\n              "note": null\n            },\n            {\n              "name": "created_at",\n              "type": {\n                "type_name": "timestamp",\n                "args": null\n              },\n              "note": null\n            }\n          ],\n          "indexes": []\n        }\n      ],\n      "enums": [],\n      "tableGroups": [],\n      "refs": []\n    }\n  ]\n}',
      postgres:
        'CREATE TABLE "posts" (\n  "id" integer PRIMARY KEY,\n  "title" varchar,\n  "body" text DEFAULT \'direct\',\n  "user_id" integer,\n  "status" varchar,\n  "created_at" timestamp\n);\n\nCOMMENT ON COLUMN "posts"."body" IS \'Content of the post\';\n',
      dbml: 'Table "posts" {\n  "id" integer [pk]\n  "title" varchar\n  "body" text [default: "direct", note: \'Content of the post\']\n  "user_id" integer\n  "status" varchar\n  "created_at" timestamp\n}\n',
      mssql:
        "CREATE TABLE [posts] (\n  [id] integer PRIMARY KEY,\n  [title] nvarchar(255),\n  [body] text DEFAULT 'direct',\n  [user_id] integer,\n  [status] nvarchar(255),\n  [created_at] timestamp\n)\nGO\n\nEXEC sp_addextendedproperty\n@name = N'Column_Description',\n@value = 'Content of the post',\n@level0type = N'Schema', @level0name = 'dbo',\n@level1type = N'Table',  @level1name = 'posts',\n@level2type = N'Column', @level2name = 'body';\nGO\n",
    },
    (value, v: 'mysql' | 'json' | 'postgres' | 'dbml' | 'mssql') => {
      test(v, () => {
        const res = exportDsl(
          {
            xiAUxVSmpCaXFi70RoWy2: {
              x: 268,
              y: 72,
              id: 'xiAUxVSmpCaXFi70RoWy2',
              name: 'posts',
              note: null,
              alias: null,
              token: {
                end: {
                  line: 8,
                  column: 2,
                  offset: 181,
                },
                start: {
                  line: 1,
                  column: 1,
                  offset: 0,
                },
              },
              fields: [
                {
                  id: 'FfC5ilxdbRsqvUn8JKCYu',
                  pk: true,
                  name: 'id',
                  note: null,
                  type: 'INTEGER',
                  table: 'xiAUxVSmpCaXFi70RoWy2',
                  token: {
                    end: {
                      line: 3,
                      column: 1,
                      offset: 36,
                    },
                    start: {
                      line: 2,
                      column: 3,
                      offset: 18,
                    },
                  },
                  dbState: {
                    dbId: 2,
                    refId: 1,
                    enumId: 1,
                    fieldId: 7,
                    indexId: 1,
                    tableId: 2,
                    schemaId: 2,
                    endpointId: 1,
                    enumValueId: 1,
                    tableGroupId: 1,
                    indexColumnId: 1,
                  },
                  endpoints: [],
                  noteToken: null,
                },
                {
                  id: 'aikMKbauXEj7EEsGCVJC7',
                  name: 'title',
                  note: null,
                  type: 'VARCHAR',
                  table: 'xiAUxVSmpCaXFi70RoWy2',
                  token: {
                    end: {
                      line: 4,
                      column: 1,
                      offset: 54,
                    },
                    start: {
                      line: 3,
                      column: 1,
                      offset: 36,
                    },
                  },
                  dbState: {
                    dbId: 2,
                    refId: 1,
                    enumId: 1,
                    fieldId: 7,
                    indexId: 1,
                    tableId: 2,
                    schemaId: 2,
                    endpointId: 1,
                    enumValueId: 1,
                    tableGroupId: 1,
                    indexColumnId: 1,
                  },
                  endpoints: [],
                  noteToken: null,
                },
                {
                  id: 'klH4ICiBfMyqVJ3h3QN8O',
                  name: 'body',
                  note: 'Content of the post',
                  type: 'TEXT',
                  table: 'xiAUxVSmpCaXFi70RoWy2',
                  token: {
                    end: {
                      line: 5,
                      column: 1,
                      offset: 116,
                    },
                    start: {
                      line: 4,
                      column: 1,
                      offset: 54,
                    },
                  },
                  dbState: {
                    dbId: 2,
                    refId: 1,
                    enumId: 1,
                    fieldId: 7,
                    indexId: 1,
                    tableId: 2,
                    schemaId: 2,
                    endpointId: 1,
                    enumValueId: 1,
                    tableGroupId: 1,
                    indexColumnId: 1,
                  },
                  dbdefault: 'direct',
                  endpoints: [],
                  noteToken: {
                    end: {
                      line: 4,
                      column: 43,
                      offset: 96,
                    },
                    start: {
                      line: 4,
                      column: 16,
                      offset: 69,
                    },
                  },
                  dbdefaultType: 'string',
                },
                {
                  id: 'NwPYIr5n46_zOD9rayUcg',
                  name: 'user_id',
                  note: null,
                  type: 'INTEGER',
                  table: 'xiAUxVSmpCaXFi70RoWy2',
                  token: {
                    end: {
                      line: 6,
                      column: 1,
                      offset: 136,
                    },
                    start: {
                      line: 5,
                      column: 1,
                      offset: 116,
                    },
                  },
                  dbState: {
                    dbId: 2,
                    refId: 1,
                    enumId: 1,
                    fieldId: 7,
                    indexId: 1,
                    tableId: 2,
                    schemaId: 2,
                    endpointId: 1,
                    enumValueId: 1,
                    tableGroupId: 1,
                    indexColumnId: 1,
                  },
                  endpoints: [],
                  noteToken: null,
                },
                {
                  id: 'Uz7_CJj62GMClLf6UJeDX',
                  name: 'status',
                  note: null,
                  type: 'VARCHAR',
                  table: 'xiAUxVSmpCaXFi70RoWy2',
                  token: {
                    end: {
                      line: 7,
                      column: 1,
                      offset: 155,
                    },
                    start: {
                      line: 6,
                      column: 1,
                      offset: 136,
                    },
                  },
                  dbState: {
                    dbId: 2,
                    refId: 1,
                    enumId: 1,
                    fieldId: 7,
                    indexId: 1,
                    tableId: 2,
                    schemaId: 2,
                    endpointId: 1,
                    enumValueId: 1,
                    tableGroupId: 1,
                    indexColumnId: 1,
                  },
                  endpoints: [],
                  noteToken: null,
                },
                {
                  id: 'mamuRRRqJuXy2nKcpGPzg',
                  name: 'created_at',
                  note: null,
                  type: 'TIMESTAMP',
                  table: 'xiAUxVSmpCaXFi70RoWy2',
                  token: {
                    end: {
                      line: 8,
                      column: 1,
                      offset: 180,
                    },
                    start: {
                      line: 7,
                      column: 1,
                      offset: 155,
                    },
                  },
                  dbState: {
                    dbId: 2,
                    refId: 1,
                    enumId: 1,
                    fieldId: 7,
                    indexId: 1,
                    tableId: 2,
                    schemaId: 2,
                    endpointId: 1,
                    enumValueId: 1,
                    tableGroupId: 1,
                    indexColumnId: 1,
                  },
                  endpoints: [],
                  noteToken: null,
                },
              ],
              schema: 1,
              dbState: {
                dbId: 2,
                refId: 1,
                enumId: 1,
                fieldId: 7,
                indexId: 1,
                tableId: 2,
                schemaId: 2,
                endpointId: 1,
                enumValueId: 1,
                tableGroupId: 1,
                indexColumnId: 1,
              },
              indexes: [],
              noteToken: null,
            },
          },
          {},
          v,
        );
        expect(res).toBe(value);
      });
    },
  );
});
