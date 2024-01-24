import { Module } from '@nestjs/common';
import { WidgetsController } from './widgets.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Widgets } from './widgets.model';
import { WidgetsService } from './widgets.service';

@Module({
  imports: [SequelizeModule.forFeature([Widgets])],
  providers: [WidgetsService],
  controllers: [WidgetsController],
})
export class WidgetsModule {
  constructor() {}
}
