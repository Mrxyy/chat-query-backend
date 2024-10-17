import {
  createParamDecorator,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import bcrypt from 'bcrypt';
import { get } from 'lodash';

async function getConfig(sequelize) {
  const { default: SequelizeAdapter, models } = await import(
    '@auth/sequelize-adapter'
  );
  const { default: Credentials } = await import(
    '@auth/express/providers/credentials'
  );

  const authAdapter = SequelizeAdapter(sequelize, {
    synchronize: false,
    models: {
      User: sequelize.models.User,
    },
  });
  const { getSession } = await import('@auth/express');
  return {
    adapter: authAdapter,
    session: {
      strategy: 'jwt',
    },
    providers: [
      Credentials({
        id: 'dev',
        name: 'dev',
        credentials: {
          // username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
          // password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials: any) {
          // 这里添加你的用户验证逻辑
          const {
            username: name,
            email,
            image = '',
            password,
          } = JSON.parse(credentials.credential as string);

          let user = await authAdapter.getUserByEmail!(email);

          if (!user && name) {
            const saltRounds = 10; // 盐的轮数
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            user = await authAdapter.createUser!({
              name,
              email,
              image,
              password: hashedPassword,
              emailVerified: new Date(),
            } as any);
          }
          if (user && (await bcrypt.compare(password, get(user, 'password')))) {
            return user; // 返回用户对象
          } else {
            throw new Error('Invalid username or password');
          }
        },
      }),
    ],
    pages: {
      signIn: '/login',
      error: '/login',
    },
    callbacks: {
      async session({ session, user, token }) {
        console.log('session');
        if (session.user) {
          if (token.sub) {
            session.user.id = token.sub;
          }

          if (token.email) {
            session.user.email = token.email;
          }
          session.user.image = token.picture;
          session.user.name = token.name;
        }

        return session;
      },

      async jwt({ token, user, account, profile, trigger }) {
        console.log(token, 'jwt');
        return token;
      },
      async redirect({ url, baseUrl }) {
        return baseUrl;
      },

      async signIn({ user, account, profile, email, credentials }) {
        console.log('signIn');
        return true;
      },
    },
    debug: process.env.NODE_ENV !== 'production',
    secret: 'header.payload.signature',
  } as Parameters<typeof getSession>[1];
}

export async function authSession(app: INestApplication, req, res, next) {
  // 定义不需要身份验证的路由
  const { getSession } = await import('@auth/express');

  const publicRoutes = [];

  // 检查请求的路径是否在公共路由中
  if (publicRoutes.includes(req.path)) {
    return next(); // 允许访问
  }

  // 对于需要身份验证的路由，获取会话信息
  const sequelize = app.get<Sequelize>(Sequelize);
  const session = await getSession(req, await getConfig(sequelize));

  // 检查会话是否存在
  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' }); // 未授权
  }
  req.user = session.user;
  // 如果会话存在，继续处理请求
  next();
}

export default async function (app: INestApplication) {
  const { ExpressAuth } = await import('@auth/express');
  const sequelize = app.get<Sequelize>(Sequelize);
  return ExpressAuth(await getConfig(sequelize));
}

// 自定义参数装饰器
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest(); // 获取请求对象
    return request.user; // 返回请求中的用户信息
  },
);
