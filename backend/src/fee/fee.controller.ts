import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { FeeService } from './fee.service';

@Controller('fee')
export class FeeController {
  constructor(private readonly feeService: FeeService) {}

  @Get('settings')
  async getSettings(@Query('category') category?: string) {
    return this.feeService.getSettings(category);
  }

  @Put('settings/:id')
  async updateSetting(
    @Param('id') id: string,
    @Body()
    data: {
      price?: number;
      unit?: string;
      description?: string;
      isActive?: boolean;
    },
  ) {
    return this.feeService.updateSetting(id, data);
  }

  @Post('settings')
  async createSetting(
    @Body()
    data: {
      category: string;
      item: string;
      unit: string;
      price: number;
      description?: string;
      threshold?: number;
    },
  ) {
    return this.feeService.createSetting(data);
  }

  @Delete('settings/:id')
  async deleteSetting(@Param('id') id: string) {
    return this.feeService.deleteSetting(id);
  }

  @Post('calculate')
  calculate(
    @Body()
    items: {
      category: string;
      item: string;
      quantity: number;
      unitPrice: number;
    }[],
  ) {
    return this.feeService.calculate(items);
  }

  @Post('records')
  async saveRecord(
    @Body()
    data: {
      items: any[];
      subtotal: number;
      discount: number;
      actualAmount: number;
      remark?: string;
      creatorId?: string;
    },
  ) {
    return this.feeService.saveRecord(data);
  }

  @Delete('records/:id')
  async deleteRecord(@Param('id') id: string) {
    return this.feeService.deleteRecord(id);
  }

  @Get('records')
  async getRecords(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.feeService.getRecords(limit || 20, offset || 0);
  }

  @Post('settings/init')
  async initDefaultSettings() {
    await this.feeService.initDefaultSettings();
    return { success: true };
  }
}
