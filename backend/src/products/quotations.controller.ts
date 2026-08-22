import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Body,
  UseGuards,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuotationsService } from './quotations.service';
import { QuotationsDocxService } from './quotations-docx.service';
import {
  CreateQuotationDto,
  QuotationFilterDto,
  UpdateQuotationStatusDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CsrfProtected } from '../common/decorators/csrf-token.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('报价管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('quotations')
export class QuotationsController {
  constructor(
    private readonly quotationsService: QuotationsService,
    private readonly quotationsDocxService: QuotationsDocxService,
  ) {}

  private canViewCost(user: CurrentUserData): boolean {
    const perms = user.permissions || [];
    return perms.includes('*') || perms.includes('product:viewCost');
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('quotation:create', 'quotation:manage')
  @ApiOperation({ summary: '生成报价（编号自动生成，保存快照）' })
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateQuotationDto,
  ) {
    return this.quotationsService.create(user.id, dto, this.canViewCost(user));
  }

  @Post(':id/versions')
  @UseGuards(PermissionsGuard)
  @Permissions('quotation:create', 'quotation:manage')
  @ApiOperation({ summary: '基于已有报价生成新版本（版本号递增）' })
  createVersion(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: CreateQuotationDto,
  ) {
    return this.quotationsService.createNewVersion(
      user.id,
      id,
      dto,
      this.canViewCost(user),
    );
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('quotation:list', 'quotation:view', 'quotation:manage')
  @ApiOperation({ summary: '报价列表（分页筛选）' })
  findAll(@Query() query: QuotationFilterDto) {
    return this.quotationsService.findAll(query);
  }

  @Post(':id/export-docx')
  @UseGuards(PermissionsGuard)
  @Permissions('quotation:view', 'quotation:manage')
  @ApiOperation({ summary: '导出报价单 DOCX（可指定模板与自定义列配置）' })
  async exportDocx(
    @Param('id') id: string,
    @Body()
    body: { templateId?: string; config?: Record<string, unknown> },
  ) {
    const { buffer, fileName } = await this.quotationsDocxService.render(id, {
      templateId: body?.templateId,
      config: body?.config,
    });
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      disposition: `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    });
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('quotation:view', 'quotation:manage')
  @ApiOperation({ summary: '报价详情（含明细快照）' })
  findOne(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.quotationsService.findOne(id, this.canViewCost(user));
  }

  @Get(':id/versions')
  @UseGuards(PermissionsGuard)
  @Permissions('quotation:view', 'quotation:manage')
  @ApiOperation({ summary: '同一版本组内全部版本' })
  versionGroup(@Param('id') id: string) {
    return this.quotationsService.getVersionGroup(id);
  }

  @Patch(':id/status')
  @UseGuards(PermissionsGuard)
  @Permissions('quotation:update', 'quotation:manage')
  @ApiOperation({ summary: '更新报价状态' })
  updateStatus(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: UpdateQuotationStatusDto,
  ) {
    return this.quotationsService.updateStatus(user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('quotation:manage')
  @ApiOperation({ summary: '删除报价（软删除 + 审计日志）' })
  remove(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.quotationsService.remove(user.id, id);
  }
}
