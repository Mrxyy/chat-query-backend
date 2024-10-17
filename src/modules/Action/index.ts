import { Module } from '@nestjs/common';
import { ActionController } from './Action.controller';
import { ActionService } from './Action.service';

@Module({
  controllers: [ActionController],
  providers: [ActionService],
  exports: [ActionService],
})
export class ActionModule {}
