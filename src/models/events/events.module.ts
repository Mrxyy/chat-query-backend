import { Module } from '@nestjs/common';
import { drawController } from './index.controller';

@Module({
  controllers: [drawController],
})
export class EventsModule {}
