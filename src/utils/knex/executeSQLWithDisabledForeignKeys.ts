import { flatten, get, map } from 'lodash';
import { dbDrivers } from '../../models/Database/DBTypes';
import { Knex } from 'knex';
import { disableConstraints, enableConstraints } from './extra';

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
      } else if (databaseType === 'postgres') {
        result.push([data.rows, data.fields]);
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
