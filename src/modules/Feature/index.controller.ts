import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { FeatureAiSettingService } from './index.service';
import { FeatureAiSetting } from 'src/models/FeatureAiSetting.model';
import { GetUser } from 'src/middleware/auth';
import { User } from 'src/models/User.model';

@Controller('feature-ai-settings')
export class FeatureAiSettingController {
  constructor(
    private readonly featureAiSettingService: FeatureAiSettingService,
  ) {}

  @Get()
  async findAll(@GetUser() user: User): Promise<FeatureAiSetting[]> {
    return this.featureAiSettingService.findAll(user.id);
  }

  @Post()
  async create(
    @Body('configs') featureAiSetting: FeatureAiSetting[],
    @GetUser() user: User,
  ): Promise<FeatureAiSetting[]> {
    return this.featureAiSettingService.create(featureAiSetting, user.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() featureAiSetting: FeatureAiSetting,
  ): Promise<FeatureAiSetting> {
    return this.featureAiSettingService.update(id, featureAiSetting);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.featureAiSettingService.remove(id);
  }

  @Delete()
  async removeAll(): Promise<void> {
    return this.featureAiSettingService.removeAll();
  }
}
