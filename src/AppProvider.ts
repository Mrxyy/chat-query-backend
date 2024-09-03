import { Injectable, INestApplication, Global, Module } from '@nestjs/common';
import { Express } from 'express';

@Injectable()
export class AppProvider {
  private app: INestApplication;

  setApp(app: INestApplication) {
    this.app = app;
  }

  getApp(): INestApplication {
    return this.app;
  }

  getHttpInstance(): Express {
    return this.app.getHttpAdapter().getInstance();
  }
}

@Global()
@Module({
  exports: [AppProvider],
  providers: [AppProvider],
})
export class AppProviderModule {}
