import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FeatureAiSetting } from 'src/models/FeatureAiSetting.model';

@Injectable()
export class FeatureAiSettingService {
  constructor(
    @InjectModel(FeatureAiSetting)
    private featureAiSettingModel: typeof FeatureAiSetting,
  ) {}

  async findAll(userId: string): Promise<FeatureAiSetting[]> {
    return this.featureAiSettingModel.findAll({
      where: {
        userId,
      },
    });
  }

  async create(
    featureAiSetting: Omit<FeatureAiSetting, 'id'>[],
    userId: string,
  ): Promise<FeatureAiSetting[]> {
    await this.featureAiSettingModel.destroy({
      where: {
        userId,
      },
      truncate: false,
    });
    return this.featureAiSettingModel.bulkCreate(
      featureAiSetting.map((v) => ({
        userId,
        ...v,
      })),
    );
  }

  async update(
    id: string,
    featureAiSetting: FeatureAiSetting,
  ): Promise<FeatureAiSetting> {
    await this.featureAiSettingModel.update(featureAiSetting, {
      where: { id },
    });
    return this.featureAiSettingModel.findByPk(id);
  }

  async remove(id: string): Promise<void> {
    await this.featureAiSettingModel.destroy({ where: { id } });
  }

  async removeAll(): Promise<void> {
    await this.featureAiSettingModel.destroy({ where: {}, truncate: true });
  }
}
