import path from 'path';
import fs from 'fs';

interface Options {
  'migrations-path'?: string;
  'models-path'?: string;
}

interface Config {
  migrationsDir: string;
  modelsDir: string;
  genTsFilePath: string;
}

export default function getConfig(options: Options): Config {
  let sequelizercConfigs: { [key: string]: string } = {};
  const sequelizercPath = path.join(
    process.env.PWD || process.cwd(),
    '.sequelizerc',
  );

  if (fs.existsSync(sequelizercPath)) {
    sequelizercConfigs = require(sequelizercPath);
  }

  if (!process.env.PWD) {
    process.env.PWD = process.cwd();
  }

  let migrationsDir = path.join(process.env.PWD, 'migrations');
  let modelsDir = path.join(process.env.PWD, 'models');

  if (options['migrations-path']) {
    migrationsDir = path.join(process.env.PWD, options['migrations-path']);
  } else if (sequelizercConfigs['migrations-path']) {
    migrationsDir = sequelizercConfigs['migrations-path'];
  }

  if (options['models-path']) {
    modelsDir = path.join(process.env.PWD, options['models-path']);
  } else if (sequelizercConfigs['models-path']) {
    modelsDir = sequelizercConfigs['models-path'];
  }

  let genTsFilePath;
  if (options['migrations-ts-path']) {
    genTsFilePath = path.join(process.env.PWD, options['migrations-ts-path']);
  } else if (sequelizercConfigs['migrations-ts-path']) {
    genTsFilePath = sequelizercConfigs['migrations-ts-path'];
  }

  return {
    genTsFilePath,
    migrationsDir,
    modelsDir,
  };
}
