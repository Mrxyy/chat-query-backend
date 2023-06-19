import { Module } from '@nestjs/common';
import { OpenAIController } from './openAi.controller';
import { OpenAIService } from './openAI.service';

@Module({
  imports: [],
  providers: [OpenAIService],
  controllers: [OpenAIController],
})
export class OpenAIModule {
  constructor() {}
}
