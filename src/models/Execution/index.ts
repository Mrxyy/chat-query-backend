import { Module } from '@nestjs/common';
import { ExecutionController } from './execution.controller';
import { ExecutionService } from './execution.service';

@Module({
  imports: [],
  providers: [ExecutionService],
  controllers: [ExecutionController],
})
export class OpenAIModule {
  constructor() {}
}
