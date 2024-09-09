class BiMap<K extends string | number | symbol, V> {
  private map = new Map<K | V, K | V>();

  constructor(obj?: { [key in K]?: V }) {
    if (obj) {
      for (const key in obj) {
        const v = obj[key];
        this.set(key, v);
        this.set(v, key);
      }
    }
  }

  set(key: K | V, value: K | V): void {
    this.map.set(key, value);
  }

  get(k: K | V): K | V | undefined {
    return this.map.get(k);
  }
}

export type dBTypes =
  | 'mysql'
  | 'mssql'
  | 'postgre'
  | 'sqlite'
  | 'mongo'
  | 'redis'
  | 'oracle';

const DriverMap = [
  {
    label: 'mysql',
    value: 'mysql2',
  },
  {
    label: 'oracle',
    value: 'oracledb',
  },
  {
    label: 'postgres',
    value: 'pg',
  },
].reduce((map, v) => {
  map[v.label] = v.value;
  return map;
}, {} as { [key: string]: any });

export const dbDrivers = new BiMap(DriverMap);
