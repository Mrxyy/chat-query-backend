import { Global, Injectable, Module } from '@nestjs/common';
import { randomUUID } from 'crypto';
import knex, { Knex } from 'knex';
import { get, set } from 'lodash';
import * as oracledb from 'oracledb';
import { config } from 'dotenv';
config();

@Injectable()
export class KnexContainer {
  knexs = new Map();

  static oracledbInit = false;

  constructor() {
    if (
      process.platform in { darwin: true, linux: true } &&
      !KnexContainer.oracledbInit
    ) {
      try {
        //https://medium.com/oracledevs/how-to-install-node-oracledb-5-5-and-oracle-database-on-apple-m1-m2-silicon-941fccda692f
        oracledb.initOracleClient({
          libDir:
            process.env['LD_LIBRARY_PATH'] ||
            process.env.HOME + '/Downloads/instantclient_19_8',
        });
        console.log('启用oracle厚模式');
        KnexContainer.oracledbInit = true;
      } catch (e) {
        console.log(e, '无法使用oracle厚模式');
      }
    }
  }

  create(config: Knex.Config, id?: string) {
    const db = knex(config);
    this.add(db, id);
    return db;
  }

  add(kenx: Knex, id?: string) {
    const key = id || randomUUID();
    this.knexs.set(key, {
      db: kenx,
    });
    set(kenx, '_key_', key);
  }

  get(id: string) {
    let client;
    if (!(client = this.knexs.get(id))) {
      // client = create();
      //Todo
    }
    return client?.db;
  }

  async destroy(key: string | Knex) {
    const id = get(key || { _key_: key }, '_key_');
    const client = this.get(id);
    console.log(this.knexs.has(id));
    if (client) {
      await client.destroy();
      this.knexs.delete(id);
    }
    console.log('db pools', id, this.knexs.size);
  }

  getAll() {
    return this.knexs.values();
  }
}

@Global()
@Module({
  providers: [KnexContainer],
  exports: [KnexContainer],
})
export class Kenx {}
