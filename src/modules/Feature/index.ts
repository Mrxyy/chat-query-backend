import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FeatureAiSetting } from 'src/models/FeatureAiSetting.model';
import { FeatureAiSettingService } from './index.service';
import { FeatureAiSettingController } from './index.controller';

@Module({
  imports: [SequelizeModule.forFeature([FeatureAiSetting])],
  providers: [FeatureAiSettingService],
  controllers: [FeatureAiSettingController],
  exports: [FeatureAiSettingService],
})
export class FeatureAiSettingModule {}
