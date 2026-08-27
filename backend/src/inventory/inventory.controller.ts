import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { InventoryImportService } from './inventory-import.service';
import {
  CreateInventoryBatchDto,
  UpdateInventoryBatchDto,
  InventoryFilterDto,
  StockQueryDto,
  InventoryImportPreviewDto,
  InventoryImportExecuteDto,
} from './dto/inventory.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CsrfProtected } from '../common/decorators/csrf-token.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('库存管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly importService: InventoryImportService,
  ) {}

  // ===== 批次 CRUD =====
  @Post('batches')
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:create', 'inventory:*')
  @ApiOperation({ summary: '创建库存批次' })
  create(@Body() dto: CreateInventoryBatchDto) {
    return this.inventoryService.create(dto);
  }

  @Get('batches')
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:view', 'inventory:*')
  @ApiOperation({ summary: '库存批次列表' })
  findAll(@Query() query: InventoryFilterDto) {
    return this.inventoryService.findAll(query);
  }

  @Get('batches/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:view', 'inventory:*')
  @ApiOperation({ summary: '库存批次详情' })
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch('batches/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:create', 'inventory:*')
  @ApiOperation({ summary: '更新库存批次' })
  update(@Param('id') id: string, @Body() dto: UpdateInventoryBatchDto) {
    return this.inventoryService.update(id, dto);
  }

  @Delete('batches/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:create', 'inventory:*')
  @ApiOperation({ summary: '删除库存批次' })
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }

  // ===== kccx 全局库存查询 =====
  @Get('stock')
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:view', 'inventory:*')
  @ApiOperation({ summary: 'kccx 全局库存查询（按 productId 分组 sum quantityRem + sum quantityRem*unitPrice）' })
  stock(@Query() query: StockQueryDto) {
    return this.inventoryService.stock(query);
  }

  @Get('fifo/:productId')
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:view', 'inventory:*')
  @ApiOperation({ summary: '全局FIFO批次（按 receivedAt 升序，不按 warehouse 过滤）' })
  fifo(@Param('productId') productId: string) {
    return this.inventoryService.fifoBatches(productId);
  }

  // ===== Excel 导入骨架（复用 product-import parse/mapping 模式） =====
  @Post('import/parse')
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:create', 'inventory:*')
  @ApiOperation({ summary: '解析上传文件，返回表头与建议映射' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: '/tmp',
        filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async parse(@UploadedFile() file: Express.Multer.File) {
    const { headers, rows } = await this.importService.parseFile(file);
    const suggested = this.importService.suggestMapping(headers);
    return { headers, rows: rows.slice(0, 5), totalRows: rows.length, suggestedMapping: suggested, allRows: rows };
  }

  @Post('import/preview')
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:create', 'inventory:*')
  @ApiOperation({ summary: '导入预览校验（字段 cpid/warehouseId/quantityIn/unitPrice/receivedAt）' })
  preview(@Body() dto: InventoryImportPreviewDto) {
    return this.importService.preview(dto);
  }

  @Post('import/execute')
  @UseGuards(PermissionsGuard)
  @Permissions('inventory:create', 'inventory:*')
  @ApiOperation({ summary: '执行导入' })
  execute(@Body() dto: InventoryImportExecuteDto) {
    return this.importService.execute(dto);
  }
}
