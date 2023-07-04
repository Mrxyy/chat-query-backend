import { Body, Controller, Post } from '@nestjs/common';
import { OpenAIService } from './openAi.service';
@Controller('/openAi/api')
export class OpenAIController {
  constructor(private server: OpenAIService) {
    server.test();
  }
  @Post('reactLive')
  ReactLive(@Body('props') props, @Body('need') need) {
    return this.server.getReactLiveCode(props, need);
  }
  @Post('code')
  Code(@Body('data') data, @Body('need') need) {
    return this.server.getFunctionCode(data, need);
  }
}
