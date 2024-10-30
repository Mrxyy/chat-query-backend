import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LLMConfig } from 'src/models/LLMConfig.model';
import { LLMModels } from 'src/models/LLMModels.model';
import { LLMConfigController } from './index.controller';
import { LLMConfigService } from './index.service';

@Module({
  imports: [SequelizeModule.forFeature([LLMConfig, LLMModels])],
  controllers: [LLMConfigController],
  providers: [LLMConfigService],
  exports: [LLMConfigService],
})
export class LLMConfigModule {}
