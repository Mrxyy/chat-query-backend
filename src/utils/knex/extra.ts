import { map } from 'lodash';

export const disableConstraints = {
  mysql: 'SET FOREIGN_KEY_CHECKS = 0;',
  mysql2: 'SET FOREIGN_KEY_CHECKS = 0;',
  sqlServer: 'ALTER TABLE table_name NOCHECK CONSTRAINT ALL;',
  postgres: 'SET CONSTRAINTS ALL DEFERRED;',
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
  postgres: 'SET CONSTRAINTS ALL IMMEDIATE', // Constraints will be enabled automatically at the end of the transaction
  oracle: `BEGIN
    FOR t IN (SELECT table_name FROM user_tables) LOOP
        FOR c IN (SELECT constraint_name FROM user_constraints WHERE table_name = t.table_name AND status = 'DISABLED') LOOP
            EXECUTE IMMEDIATE 'ALTER TABLE ' || t.table_name || ' ENABLE CONSTRAINT ' || c.constraint_name;
        END LOOP;
    END LOOP;
END;
`,
};

export const showDbs = {
  postgres: `SELECT datname AS Database
FROM pg_database
WHERE datistemplate = false
AND has_database_privilege(current_user, datname, 'CONNECT')`,
  mysql: 'SHOW DATABASES',
  oracle: 'SELECT username AS Database FROM all_users',
  sqlServer: 'SELECT name AS Database FROM sys.databases',
  getKnewResult(data, type) {
    switch (type) {
      case 'postgres':
        return map(data.rows, ({ database, Database, DATABASE }) => ({
          name: Database || database || DATABASE,
        }));
      case 'mysql':
        return map(data[0], ({ database, Database, DATABASE }) => ({
          name: Database || database || DATABASE,
        }));
      case 'oracle':
        return map(data, ({ database, Database, DATABASE }) => ({
          name: Database || database || DATABASE,
        }));
      case 'sqlServer':
        return;
    }
  },
};

export const switchDb = (database_name) => {
  return {
    mysql: `USE  ${database_name};`,
    postgresql: `\c ${database_name}`, // 示例，PostgreSQL 不能直接用 USE
    sqlServer: `USE ${database_name};`,
    oracle: `ALTER SESSION SET CURRENT_SCHEMA = ${database_name};`,
  };
};
