import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { WidgetsService } from './widgets.service';
import { GetUser } from 'src/middleware/auth';
import { User } from 'src/models/User.model';

@Controller('/widgets')
export class WidgetsController {
  constructor(private widgetsService: WidgetsService) {}

  // 获取所有组件
  @Get('/')
  async getAll(@GetUser() user: User) {
    return this.widgetsService.getAll(user.id);
  }

  // 创建新组件
  @Post('/')
  async create(@Body() createDto: any, @GetUser() user: User) {
    return this.widgetsService.create(createDto, user.id);
  }

  // 更新组件
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
    @GetUser() user: User,
  ) {
    return this.widgetsService.update(id, updateDto, user.id);
  }

  // 删除组件
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @GetUser() user: User) {
    return this.widgetsService.delete(id, user.id);
  }
}
