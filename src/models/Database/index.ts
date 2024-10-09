// db.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DBController } from './index.controller';
import { DBService } from './index.service';
import { DB } from './DB.model';
import { DBSchema } from './DBSchema.model';

@Module({
  imports: [SequelizeModule.forFeature([DB, DBSchema])],
  providers: [DBService],
  controllers: [DBController],
  exports: [DBService],
})
export class DBModule {}
