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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ProductImportService } from './product-import.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateImportTemplateDto,
  ImportExecuteDto,
  ImportPreviewDto,
  UpdateImportTemplateDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CsrfProtected } from '../common/decorators/csrf-token.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

const TMP_DIR = './uploads/tmp';
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

const ALLOWED_IMPORT_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

@ApiTags('产品批量导入')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('products/import')
export class ProductImportController {
  constructor(
    private readonly productImportService: ProductImportService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('upload')
  @UseGuards(PermissionsGuard)
  @Permissions('product:import')
  @ApiOperation({ summary: '上传并解析文件（返回表头与前 5 行预览）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: TMP_DIR,
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          if (!ALLOWED_IMPORT_EXTENSIONS.includes(ext)) {
            return cb(new Error('仅支持 xlsx / xls / csv 格式'), '');
          }
          cb(null, `${uuidv4()}${ext}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024, files: 1 },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('未上传文件');
    }
    try {
      const parsed = await this.productImportService.parseFile(file);
      const suggestion = this.productImportService.suggestMapping(
        parsed.headers,
      );
      return {
        headers: parsed.headers,
        // 全量行返回给前端，由前端在 preview/execute 时回传；
        // previewRows 仅用于界面展示前几行
        rows: parsed.rows,
        previewRows: parsed.rows.slice(0, 5),
        totalRows: parsed.rows.length,
        suggestion,
      };
    } catch (error) {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  @Post('preview')
  @UseGuards(PermissionsGuard)
  @Permissions('product:import')
  @ApiOperation({ summary: '映射预览与校验' })
  async preview(@Body() dto: ImportPreviewDto) {
    return this.productImportService.preview(dto);
  }

  @Post('execute')
  @UseGuards(PermissionsGuard)
  @Permissions('product:import')
  @ApiOperation({ summary: '执行导入' })
  execute(@CurrentUser() user: CurrentUserData, @Body() dto: ImportExecuteDto) {
    return this.productImportService.execute(user.id, dto);
  }

  @Get('logs')
  @UseGuards(PermissionsGuard)
  @Permissions('product:import', 'product:list')
  @ApiOperation({ summary: '导入记录' })
  logs(@Query('page') page = 1, @Query('pageSize') pageSize = 20) {
    return this.productImportService.getLogs({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 20,
    });
  }

  @Post('templates')
  @UseGuards(PermissionsGuard)
  @Permissions('product:import')
  @ApiOperation({ summary: '保存列映射模板' })
  createTemplate(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateImportTemplateDto,
  ) {
    return this.prisma.productImportTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        mappingConfig: dto.mappingConfig,
        isGlobal: dto.isGlobal ?? false,
        createdBy: user.id,
      },
    });
  }

  @Get('templates')
  @UseGuards(PermissionsGuard)
  @Permissions('product:import', 'product:list')
  @ApiOperation({ summary: '映射模板列表' })
  listTemplates(@CurrentUser() user: CurrentUserData) {
    return this.prisma.productImportTemplate.findMany({
      where: { OR: [{ isGlobal: true }, { createdBy: user.id }] },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Patch('templates/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('product:import')
  @ApiOperation({ summary: '更新映射模板' })
  updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateImportTemplateDto,
  ) {
    return this.prisma.productImportTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        mappingConfig: dto.mappingConfig as object,
        isGlobal: dto.isGlobal,
      },
    });
  }

  @Delete('templates/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('product:import')
  @ApiOperation({ summary: '删除映射模板' })
  deleteTemplate(@Param('id') id: string) {
    return this.prisma.productImportTemplate.delete({ where: { id } });
  }
}
