import { Global, Module } from '@nestjs/common';
import { O1Controller } from './o1.controller';
import { O1Service } from './o1.service';

@Global()
@Module({
  controllers: [O1Controller],
  providers: [O1Service],
  exports: [O1Service],
})
export class O1 {}
