import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { invoke } from 'lodash';
import { LLMConfig } from 'src/models/LLMConfig.model';
import { LLMModels } from 'src/models/LLMModels.model';

@Injectable()
export class LLMConfigService {
  constructor(
    @InjectModel(LLMConfig)
    private readonly llmConfigModel: typeof LLMConfig,
    @InjectModel(LLMModels)
    private readonly llmModelsModel: typeof LLMModels,
  ) {}

  async find(userId: string): Promise<LLMConfig> {
    return this.llmConfigModel.findOne({
      where: {
        userId,
      },
      include: [
        {
          model: LLMModels,
        },
      ],
    });
  }

  async create(
    createDto: Pick<LLMConfig, 'defaultModel' | 'models' | 'userId'>,
  ): Promise<LLMConfig> {
    const llmConfig = await this.llmConfigModel.create(
      {
        defaultModel: createDto.defaultModel,
        userId: createDto.userId,
        models: createDto.models,
      },
      {
        include: [
          {
            model: LLMModels,
          },
        ],
      },
    );

    // 如果需要在创建时关联 LLMModels
    // if (createDto.models) {
    //   await llmConfig.$set('llmModels', createDto.models);
    // }

    return llmConfig;
  }

  async update(
    id: string,
    updateDto: Pick<LLMConfig, 'defaultModel' | 'models' | 'userId'>,
  ): Promise<LLMConfig> {
    await this.llmConfigModel.update(updateDto, {
      where: { id },
    });

    const updatedConfig = await this.llmConfigModel.findByPk(id, {
      include: [
        {
          model: LLMModels,
        },
      ],
    });

    this.llmModelsModel.destroy({
      where: {
        llmConfigId: id,
      },
    });

    const llmModels = await this.llmModelsModel.bulkCreate(
      updateDto.models.map((v) => ({
        ...v,
        llmConfigId: id,
      })),
    );
    //执行
    const result = await (updatedConfig as any).setModels(llmModels);

    return result;
  }

  async delete(id: string): Promise<void> {
    await this.llmConfigModel.destroy({ where: { id } });
  }

  async deleteAll(): Promise<void> {
    await this.llmConfigModel.destroy({ where: {}, truncate: true });
  }
}
