import { Body, Controller, Post, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { Readable } from 'stream';
import { streamGenerateCode } from './generateCode';

@Controller('draw')
export class drawController {
  @Post('/page')
  async getPage(
    @Res({ passthrough: true }) response: Response,
    @Body() { data },
  ): Promise<StreamableFile> {
    const stream = new Readable({
      read() {
        return;
      },
    });

    streamGenerateCode(data, stream).finally(() => {
      stream.push(null);
    });

    response.set({
      'Content-Type': 'application/json',
    });

    return new StreamableFile(stream);
  }
}
