import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuotationTemplatesService } from './quotation-templates.service';
import { CreateQuotationTemplateDto, UpdateQuotationTemplateDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CsrfProtected } from '../common/decorators/csrf-token.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('报价模板管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('quotation-templates')
export class QuotationTemplatesController {
  constructor(
    private readonly quotationTemplatesService: QuotationTemplatesService,
  ) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('quotationTemplate:manage')
  @ApiOperation({ summary: '创建报价模板' })
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateQuotationTemplateDto,
  ) {
    return this.quotationTemplatesService.create(user.id, dto);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('quotationTemplate:manage', 'quotation:list', 'quotation:view')
  @ApiOperation({ summary: '报价模板列表' })
  findAll() {
    return this.quotationTemplatesService.findAll();
  }

  @Get('default')
  @UseGuards(PermissionsGuard)
  @Permissions('quotationTemplate:manage', 'quotation:list', 'quotation:view')
  @ApiOperation({ summary: '默认模板（无则自动创建）' })
  getDefault() {
    return this.quotationTemplatesService.getDefault();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('quotationTemplate:manage', 'quotation:list', 'quotation:view')
  @ApiOperation({ summary: '模板详情' })
  findOne(@Param('id') id: string) {
    return this.quotationTemplatesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('quotationTemplate:manage')
  @ApiOperation({ summary: '更新模板' })
  update(@Param('id') id: string, @Body() dto: UpdateQuotationTemplateDto) {
    return this.quotationTemplatesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('quotationTemplate:manage')
  @ApiOperation({ summary: '删除模板' })
  remove(@Param('id') id: string) {
    return this.quotationTemplatesService.remove(id);
  }
}
