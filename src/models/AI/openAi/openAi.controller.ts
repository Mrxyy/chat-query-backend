import { Controller } from '@nestjs/common';
import { OpenAIService } from './openAi.service';
@Controller('/openAi/api')
export class OpenAIController {
  constructor(server: OpenAIService) {
    server.test();
  }
}
