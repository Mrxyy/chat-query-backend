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
import { Widgets } from './widgets.model';

@Controller('/widgets')
export class WidgetsController {
  constructor(private widgetsService: WidgetsService) {}
  // 获取所有组件
  @Get('/')
  async getAll() {
    return this.widgetsService.getAll();
  }

  // 创建新组件
  @Post('/')
  async create(@Body() createDto) {
    return this.widgetsService.create(createDto);
  }

  // 更新组件
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto) {
    return this.widgetsService.update(id, updateDto);
  }

  // 删除组件
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.widgetsService.delete(id);
  }
}
