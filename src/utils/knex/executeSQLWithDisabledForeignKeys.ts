import { Knex } from 'knex';

export const disableConstraints = {
  mysql: 'SET FOREIGN_KEY_CHECKS = 0;',
  mysql2: 'SET FOREIGN_KEY_CHECKS = 0;',
  sqlServer: 'ALTER TABLE table_name NOCHECK CONSTRAINT ALL;',
  postgresql: 'SET CONSTRAINTS ALL DEFERRED;',
  oracle: 'ALTER TABLE table_name DISABLE ALL TRIGGERS;',
};

// Enable foreign key constraints for different databases
export const enableConstraints = {
  mysql: 'SET FOREIGN_KEY_CHECKS = 1;',
  mysql2: 'SET FOREIGN_KEY_CHECKS = 1;',
  sqlServer: 'ALTER TABLE table_name CHECK CONSTRAINT ALL;',
  postgresql: '', // Constraints will be enabled automatically at the end of the transaction
  oracle: 'ALTER TABLE table_name ENABLE ALL TRIGGERS;',
};

const annotationMatching = /(--.*)|(((\/\*)+?[\w\W]+?(\*\/)+))/g;

export async function executeSQLWithDisabledForeignKeys(
  kenx: Knex,
  sqlArray: string[],
  params: any[][] = [],
) {
  try {
    // Disable foreign key constraints for different databases

    // Replace 'databaseType' with the actual type of your database (e.g., 'mysql', 'sqlServer', etc.)
    const databaseType = kenx.client.config.client;

    // Disable foreign key constraints
    console.log(disableConstraints[databaseType]);
    await kenx.schema.raw(disableConstraints[databaseType]);

    // Execute the main SQL query
    const result = [];
    for (const index in sqlArray) {
      result.push(
        // ${sql}
        await (kenx.schema.raw as any)(
          sqlArray[index].replace(annotationMatching, ''),
          params[index],
        ),
      );
    }
    return result;
  } catch (error) {
    console.error('执行失败☹️:', error);
  } finally {
    const databaseType = kenx.client.config.client;
    await kenx.schema.raw(enableConstraints[databaseType]);
  }
}
