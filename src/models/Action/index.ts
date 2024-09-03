import { Module } from '@nestjs/common';
import { ActionController } from './Action.controller';
import { ActionService } from './Action.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ActionModel } from './Action.model';
import { QueriesModel } from '../Querys';

const AppModel = SequelizeModule.forFeature([ActionModel]);
@Module({
  imports: [AppModel],
  controllers: [ActionController],
  providers: [ActionService],
  exports: [ActionService],
})
export class ActionModule {}
