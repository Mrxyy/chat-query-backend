// db.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DBController } from './index.controller';
import { DBService } from './index.service';

@Module({
  providers: [DBService],
  controllers: [DBController],
  exports: [DBService],
})
export class DBModule {}
