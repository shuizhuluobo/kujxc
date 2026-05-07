import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CsrfProtected } from '../common/decorators/csrf-token.decorator';
import { FeeService } from './fee.service';
import {
  CreateFeeSettingDto,
  UpdateFeeSettingDto,
  CalculateFeeDto,
  SaveFeeRecordDto,
  FeeRecordsQueryDto,
} from './dto/fee.dto';

@ApiTags('费用管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
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
    @Body() data: UpdateFeeSettingDto,
  ) {
    return this.feeService.updateSetting(id, data);
  }

  @Post('settings')
  async createSetting(@Body() data: CreateFeeSettingDto) {
    return this.feeService.createSetting(data);
  }

  @Delete('settings/:id')
  async deleteSetting(@Param('id') id: string) {
    return this.feeService.deleteSetting(id);
  }

  @Post('calculate')
  calculate(@Body() body: CalculateFeeDto) {
    return this.feeService.calculate(body.items);
  }

  @Post('records')
  async saveRecord(@Body() data: SaveFeeRecordDto) {
    return this.feeService.saveRecord(data);
  }

  @Delete('records/:id')
  async deleteRecord(@Param('id') id: string) {
    return this.feeService.deleteRecord(id);
  }

  @Get('records')
  async getRecords(@Query() query: FeeRecordsQueryDto) {
    return this.feeService.getRecords(query.limit, query.offset);
  }

  @Post('settings/init')
  async initDefaultSettings() {
    await this.feeService.initDefaultSettings();
    return { success: true };
  }
}
