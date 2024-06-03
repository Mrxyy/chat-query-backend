import { flatten, get, map } from 'lodash';
import { dbDrivers } from './../../models/Querys/DBTypes';
import { Knex } from 'knex';

export const disableConstraints = {
  mysql: 'SET FOREIGN_KEY_CHECKS = 0;',
  mysql2: 'SET FOREIGN_KEY_CHECKS = 0;',
  sqlServer: 'ALTER TABLE table_name NOCHECK CONSTRAINT ALL;',
  postgresql: 'SET CONSTRAINTS ALL DEFERRED;',
  oracle: `BEGIN
    FOR t IN (SELECT table_name FROM user_tables) LOOP
        FOR c IN (SELECT constraint_name FROM user_constraints WHERE table_name = t.table_name AND status = 'ENABLED') LOOP
            EXECUTE IMMEDIATE 'ALTER TABLE ' || t.table_name || ' DISABLE CONSTRAINT ' || c.constraint_name;
        END LOOP;
    END LOOP;
END;
`,
};

// Enable foreign key constraints for different databases
export const enableConstraints = {
  mysql: 'SET FOREIGN_KEY_CHECKS = 1;',
  mysql2: 'SET FOREIGN_KEY_CHECKS = 1;',
  sqlServer: 'ALTER TABLE table_name CHECK CONSTRAINT ALL;',
  postgresql: '', // Constraints will be enabled automatically at the end of the transaction
  oracle: `BEGIN
    FOR t IN (SELECT table_name FROM user_tables) LOOP
        FOR c IN (SELECT constraint_name FROM user_constraints WHERE table_name = t.table_name AND status = 'DISABLED') LOOP
            EXECUTE IMMEDIATE 'ALTER TABLE ' || t.table_name || ' ENABLE CONSTRAINT ' || c.constraint_name;
        END LOOP;
    END LOOP;
END;
`,
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
    const databaseType = dbDrivers.get(kenx.client.config.client);

    // Disable foreign key constraints
    console.log(disableConstraints[databaseType]);
    await kenx.schema.raw(disableConstraints[databaseType]);

    // Execute the main SQL query
    const result = [];
    for (const index in sqlArray) {
      const data = await (kenx.schema.raw as any)(
        sqlArray[index].replace(annotationMatching, ''),
        params[index],
      );
      if (databaseType === 'oracle') {
        result.push([
          data,
          map(get(data, '0', []), (v, k) => {
            return { name: k };
          }),
        ]);
      } else {
        result.push(data);
      }
    }
    return result;
  } catch (error) {
    console.error('执行失败☹️:', error);
  } finally {
    const databaseType = dbDrivers.get(kenx.client.config.client);
    await kenx.schema.raw(enableConstraints[databaseType]);
  }
}
