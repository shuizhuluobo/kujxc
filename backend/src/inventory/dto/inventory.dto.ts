import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateInventoryBatchDto {
  @ApiProperty({ description: '产品ID (cpid)' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ required: false, description: '仓库ID' })
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiProperty({ required: false, description: '库位/门店名称 storeName' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  storeName?: string;

  @ApiProperty({ description: '入库数量 quantityIn' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantityIn: number;

  @ApiProperty({ description: '单价 unitPrice' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ required: false, description: '采购价 purchasePrice' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @ApiProperty({ description: '入库时间 receivedAt (ISO8601)' })
  @IsDateString()
  receivedAt: string;

  @ApiProperty({ required: false, description: '供应商ID' })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiProperty({ required: false, description: '批次ID rkid yyyyMMdd+4，缺省自动生成' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  id?: string;

  @ApiProperty({ required: false, description: '状态', default: 'NORMAL' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, description: 'flag YES/NO', default: 'YES' })
  @IsOptional()
  @IsString()
  flag?: string;
}

export class UpdateInventoryBatchDto extends PartialType(CreateInventoryBatchDto) {}

export class InventoryFilterDto extends PaginationDto {
  @ApiProperty({ required: false, description: '按 productId 筛选' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ required: false, description: '按 warehouseId 筛选（仅展示用，不影响库存统计）' })
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiProperty({ required: false, description: '按 supplierId 筛选' })
  @IsOptional()
  @IsString()
  supplierId?: string;
}

export class StockQueryDto extends PaginationDto {
  @ApiProperty({ required: false, description: '按 productId 精确筛选' })
  @IsOptional()
  @IsString()
  productId?: string;
}

/** Excel 导入：列映射配置 cpid 目标字段 -> 源列名 */
export type InventoryMappingConfig = Record<string, string>;

export class InventoryImportPreviewDto {
  @ApiProperty({ description: '列映射配置' })
  @IsNotEmpty()
  mappingConfig: InventoryMappingConfig;

  @ApiProperty({ type: [Object], description: '原始行数据' })
  rows: Record<string, unknown>[];
}

export class InventoryImportExecuteDto {
  @ApiProperty({ description: '列映射配置' })
  @IsNotEmpty()
  mappingConfig: InventoryMappingConfig;

  @ApiProperty({ type: [Object], description: '原始行数据' })
  rows: Record<string, unknown>[];
}
