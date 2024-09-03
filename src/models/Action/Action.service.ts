import { create } from 'zustand';
import { ActionModel } from './Action.model';
// service code
import { Injectable } from '@nestjs/common';
import { get, map, slice } from 'lodash';
import { Sequelize, Utils } from 'sequelize';
import * as finale from 'finale-rest';
import { AppProvider } from 'src/AppProvider';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class ActionService {
  constructor(
    private appProvider: AppProvider,
    @InjectModel(ActionModel) private actionModel: typeof ActionModel,
  ) {}
  async exportApi(modelSequelize: Sequelize, prefix: string) {
    const httpInstance = this.appProvider.getHttpInstance();
    const nextRoute = slice(httpInstance._router.stack, -2);
    httpInstance._router.stack = slice(httpInstance._router.stack, 0, -2);

    httpInstance._router.stack = httpInstance._router.stack.filter((v) => {
      return get(v, 'route.path', '').indexOf(prefix) === -1;
    });
    finale.initialize({
      app: httpInstance,
      sequelize: modelSequelize,
    });
    map(modelSequelize.models, (model) => {
      const endpoints = [];
      const plural = Utils.pluralize(model.name);
      endpoints.push(prefix + '/' + plural);
      endpoints.push(prefix + '/' + plural + '/:id');
      const userResource = finale.resource({
        model,
        include: map(model.associations, (association, k) => {
          let mod;
          if (association.target === model) {
            mod = association.source; // 对于 BelongsTo，associationName 对应的是 source 模型
          }
          mod = association.target;
          return {
            model: mod,
            as: association.as,
          };
        }),
        endpoints,
        associations: true,
      });
      console.log(userResource.endpoints, model.associations);
    });

    httpInstance._router.stack.push(...nextRoute);
  }
  async createAction(DbId: string) {
    return this.actionModel.create({
      DbId,
    });
  }

  async findAction(DbId: string) {
    return this.actionModel.findOne({
      where: {
        DbId,
      },
    });
  }

  async findAllAction() {
    return this.actionModel.findAll();
  }
}
