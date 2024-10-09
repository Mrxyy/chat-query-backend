import { Global, Injectable, Module } from '@nestjs/common';
import { randomUUID } from 'crypto';
import knex, { Knex } from 'knex';
import { get, set } from 'lodash';
import * as oracledb from 'oracledb';
import { config } from 'dotenv';
config();

class LRUCache {
  cache: Map<string, Knex>;
  limit: number;
  constructor(limit) {
    this.limit = limit;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const value = this.cache.get(key);
    // Move to the end to show that it was recently used
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.limit) {
      // Remove the first (least recently used) entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  delete(key) {
    this.cache.delete(key);
  }

  keys() {
    return this.cache.keys();
  }
}

@Injectable()
export class KnexContainer {
  knexs = new LRUCache(50);

  static oracledbInit = false;

  constructor() {
    if (
      process.platform in { darwin: true, linux: true } &&
      !KnexContainer.oracledbInit
    ) {
      try {
        //mac:https://medium.com/oracledevs/oracle-instant-client-macos-arm64-for-apple-m1-m2-m3-platforms-is-now-available-950f1bc041f9
        //https://medium.com/oracledevs/how-to-install-node-oracledb-5-5-and-oracle-database-on-apple-m1-m2-silicon-941fccda692f
        console.log('尝试使用oracle厚模式');
        oracledb.initOracleClient({
          libDir:
            process.env['LD_LIBRARY_PATH'] ||
            // process.env.HOME + '/Downloads/instantclient_23_3',
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
    id && this.add(db, id);
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
    console.log(this.knexs.keys());
    return client?.db;
  }

  async destroy(key: string | Knex) {
    const id = get(key, '_key_');
    const client = this.get(id);
    if (client) {
      await client.destroy();
      this.knexs.delete(id);
    }
    console.log('db pools', id, this.knexs);
  }

  getAll() {
    return this.knexs.keys();
  }
}

@Global()
@Module({
  providers: [KnexContainer],
  exports: [KnexContainer],
})
export class Kenx {}
