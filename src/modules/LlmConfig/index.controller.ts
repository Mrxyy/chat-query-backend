import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { LLMConfigService } from './index.service';
import { LLMConfig } from 'src/models/LLMConfig.model';
import { GetUser } from 'src/middleware/auth';
import { User } from 'src/models/User.model';

@Controller('llm-config')
export class LLMConfigController {
  constructor(private readonly llmConfigService: LLMConfigService) {}

  @Get()
  async find(@GetUser() user: User): Promise<LLMConfig> {
    return this.llmConfigService.find(user.id);
  }

  @Post()
  async create(
    @GetUser() user: User, // 获取当前用户
    @Body() createDto: LLMConfig, // 其他创建参数
  ): Promise<LLMConfig> {
    return this.llmConfigService.create({
      ...createDto,
      userId: user.id,
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() updateDto: LLMConfig,
  ): Promise<LLMConfig> {
    return this.llmConfigService.update(id, {
      ...updateDto,
      userId: user.id,
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.llmConfigService.delete(id);
  }

  @Delete()
  async deleteAll(): Promise<void> {
    return this.llmConfigService.deleteAll();
  }
}
