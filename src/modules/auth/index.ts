// auth.module.ts
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AuthController } from './auth.controller'; // 创建这个控制器
import { AuthService } from './auth.service'; // 创建这个服务
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../../models/User.model';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer
    //   .apply(ExpressAuth({ providers: [] })) // 在这里添加您的提供者
    //   .forRoutes('/auth/*'); // 应用到/auth/*路由
  }
}
