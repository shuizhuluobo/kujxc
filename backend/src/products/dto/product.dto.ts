import { ProductStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ProductImageDto {
  @ApiProperty({ description: '图片 URL' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ required: false, description: '图片说明' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ required: false, description: '显示顺序' })
  @IsOptional()
  @IsInt()
  displayOrder?: number;
}

export class ProductCertificateDto {
  @ApiProperty({ description: '证书文件 URL' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ description: '证书名称' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ required: false, description: '证书说明' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ required: false, description: '显示顺序' })
  @IsOptional()
  @IsInt()
  displayOrder?: number;
}

export class CreateProductDto {
  @ApiProperty({ description: '产品名称（品牌型号，必选）' })
  @IsString()
  @IsNotEmpty({ message: '产品名称不能为空' })
  @MaxLength(200)
  name: string;

  @ApiProperty({
    required: false,
    description: '型号（独立字段，用于报价单「型号/品牌型号」列）',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;

  @ApiProperty({ required: false, description: '详细参数' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false,
    enum: ProductStatus,
    description: '产品状态',
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({
    required: false,
    description: '是否为商城产品：勾选时价格字段为商城价格，未勾选时为售价',
  })
  @IsOptional()
  @IsBoolean()
  isMarketProduct?: boolean;

  @ApiProperty({ required: false, default: '台', description: '计量单位' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiProperty({ required: false, description: '最小起订量' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minOrderQty?: number;

  @ApiProperty({ required: false, description: '保修期' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  warranty?: string;

  @ApiProperty({ required: false, description: '供应商' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  supplier?: string;

  @ApiProperty({ required: false, description: '商城链接' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  marketUrl?: string;

  @ApiProperty({ required: false, description: '商城价格（仅商城产品生效）' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  marketPrice?: number;

  @ApiProperty({ required: false, description: '售价（非商城产品生效）' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiProperty({ required: false, description: '成本价' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiProperty({ description: '品牌 ID' })
  @IsString()
  @IsNotEmpty()
  brandId: string;

  @ApiProperty({ description: '类型 ID' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ required: false, type: [String], description: '标签 ID 列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiProperty({
    required: false,
    type: [ProductImageDto],
    description: '图片列表',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @ApiProperty({
    required: false,
    type: [ProductCertificateDto],
    description: '证书列表',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductCertificateDto)
  certificates?: ProductCertificateDto[];
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

/** 逗号分隔转数组，兼容 query 重复参数 */
export function toArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string');
  }
  if (typeof value === 'string' && value.length > 0) {
    return value.split(',').filter((v) => v.length > 0);
  }
  return undefined;
}

export class ProductFilterDto extends PaginationDto {
  @ApiProperty({
    required: false,
    description: '品牌 ID 列表（逗号分隔或多选）',
  })
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsArray()
  @IsString({ each: true })
  brandIds?: string[];

  @ApiProperty({ required: false, description: '类型 ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    required: false,
    description: '标签 ID 列表（逗号分隔或多选）',
  })
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiProperty({
    required: false,
    enum: [...Object.values(ProductStatus), 'ALL'],
    description: '产品状态',
  })
  @IsOptional()
  @IsString()
  status?: ProductStatus | 'ALL';

  @ApiProperty({ required: false, description: '最低价格' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ required: false, description: '最高价格' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({
    required: false,
    enum: ['updatedAt', 'staleFirst'],
    description: '排序',
  })
  @IsOptional()
  @IsString()
  orderBy?: 'updatedAt' | 'staleFirst';
}

export class BatchStatusDto {
  @ApiProperty({ type: [String], description: '产品 ID 列表' })
  @IsArray()
  @IsString({ each: true })
  ids: string[];

  @ApiProperty({ enum: ProductStatus })
  @IsEnum(ProductStatus)
  status: ProductStatus;
}

export class BatchDeleteDto {
  @ApiProperty({ type: [String], description: '产品 ID 列表' })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
