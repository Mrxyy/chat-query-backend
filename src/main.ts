import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { AppProvider } from './AppProvider';
import getAuth, { authSession } from './middleware/auth';
import { bind } from 'lodash';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appProvider = app.get(AppProvider);
  appProvider.setApp(app);
  app.enableCors({
    origin: ['http://localhost:3000'], // 允许的源
    credentials: true,
  });
  app.use(bodyParser.json({ limit: '50mb' })); // JSON 请求体
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // 表单请求体
  app.use('/auth/*', await getAuth(app));
  app.use(authSession.bind(app, app));

  await app.listen(3001);
  console.log('http://127.0.0.1:3001');
}
bootstrap();
