import { Injectable } from '@nestjs/common';
import { Widgets } from '../../models/widgets.model';
import { InjectModel } from '@nestjs/sequelize';
import { pick } from 'lodash';

@Injectable()
export class WidgetsService {
  constructor(@InjectModel(Widgets) private widgets: typeof Widgets) {}
  // 获取所有组件
  async getAll(userId: string) {
    const widget = await this.widgets.findAll({
      where: { userId },
    });
    return widget;
  }

  // 创建新组件
  async create(
    createDto: Omit<Widgets, 'id' | 'createdAt' | 'updatedAt' | 'DeletedAt'>,
    userId: string,
  ) {
    try {
      const widget = await this.widgets.create({ ...createDto, userId });
      return widget;
    } catch (e: any) {
      return pick(e, 'errors', []);
    }
  }

  // 更新组件
  async update(
    id: string,
    updateDto: Partial<
      Omit<Widgets, 'id' | 'createdAt' | 'updatedAt' | 'DeletedAt'>
    >,
    userId: string,
  ) {
    await this.widgets.update(updateDto, {
      where: { id, userId },
    });
    return this.widgets.findOne({
      where: { id, userId },
    });
  }

  // 删除组件
  async delete(id: string, userId: string) {
    const numberOfDeletedRows = await this.widgets.destroy({
      where: { id, userId },
    });

    if (numberOfDeletedRows === 0) {
      throw new Error('Widget not found');
    }
    return this.widgets.findOne({
      where: { id, userId },
    });
  }
}
