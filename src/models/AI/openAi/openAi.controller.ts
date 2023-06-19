import { Controller } from '@nestjs/common';
import { OpenAIService } from './openAI.service';

@Controller('/openAi/api')
export class OpenAIController {
  constructor(server: OpenAIService) {
    server.test();
  }
}
