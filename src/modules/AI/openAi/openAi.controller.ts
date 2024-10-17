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
    return this.server.getFunctionCode(data.slice(0, 2), need);
  }
  @Post('checkQuery')
  checkQuery(@Body('messageList') messageList) {
    return this.server.checkQuery(messageList);
  }
  @Post('getWidgetProps')
  getWidgetProps(
    @Body('code') code,
    @Body('fn') fn,
    @Body('requirements') requirements,
  ) {
    return this.server.getWidgetProps(code, fn, requirements);
  }
}
