import { ProductStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

/**
 * 列映射配置：目标字段 → 源列名，如 { name: '产品名称', marketPrice: '价格' }
 */
export type MappingConfigDto = Record<string, string>;

export class ImportOptionsDto {
  @ApiProperty({
    required: false,
    default: true,
    description: '品牌不存在时自动创建',
  })
  @IsOptional()
  @IsBoolean()
  createMissingBrand?: boolean;

  @ApiProperty({
    required: false,
    default: true,
    description: '类型不存在时自动创建',
  })
  @IsOptional()
  @IsBoolean()
  createMissingCategory?: boolean;

  @ApiProperty({
    required: false,
    default: true,
    description: '标签不存在时自动创建',
  })
  @IsOptional()
  @IsBoolean()
  createMissingTags?: boolean;

  @ApiProperty({
    required: false,
    enum: ProductStatus,
    description: '导入后默认状态',
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  defaultStatus?: ProductStatus;

  @ApiProperty({
    required: false,
    enum: ['skip', 'overwrite', 'create'],
    description: '重复数据处理策略',
  })
  @IsOptional()
  @IsString()
  duplicateStrategy?: 'skip' | 'overwrite' | 'create';
}

export class ImportPreviewDto {
  @ApiProperty({ description: '列映射配置' })
  @IsNotEmpty()
  mappingConfig: MappingConfigDto;

  @ApiProperty({ type: [Object], description: '原始行数据' })
  @IsArray()
  rows: Record<string, unknown>[];

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ImportOptionsDto)
  options?: ImportOptionsDto;
}

export class ImportExecuteDto {
  @ApiProperty({ description: '列映射配置' })
  @IsNotEmpty()
  mappingConfig: MappingConfigDto;

  @ApiProperty({ type: [Object], description: '原始行数据' })
  @IsArray()
  rows: Record<string, unknown>[];

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ImportOptionsDto)
  options?: ImportOptionsDto;
}

export class CreateImportTemplateDto {
  @ApiProperty({ description: '模板名称' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ required: false, description: '模板描述' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ description: '列映射配置 JSON' })
  @IsNotEmpty()
  mappingConfig: Record<string, string>;

  @ApiProperty({ required: false, default: false, description: '是否全局模板' })
  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;
}

export class UpdateImportTemplateDto extends PartialType(
  CreateImportTemplateDto,
) {}

export class ImportQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 20;
}
