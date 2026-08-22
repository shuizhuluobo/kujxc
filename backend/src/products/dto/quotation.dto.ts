import { QuotationStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QuotationItemDto {
  @ApiProperty({
    required: false,
    description: '产品 ID（产品删除后可为空，快照保留）',
  })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ description: '产品快照 JSON（品牌型号、参数、价格等）' })
  @IsNotEmpty()
  productSnapshot: Record<string, unknown>;

  @ApiProperty({
    required: false,
    type: [String],
    description: '选中展示的图片 URL',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedImages?: string[];

  @ApiProperty({
    required: false,
    type: [String],
    description: '选中展示的证书 URL',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedCerts?: string[];

  @ApiProperty({ description: '数量' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: '单价' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({
    required: false,
    description: '折扣百分比（如 90 表示 9 折）',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  discount?: number;

  @ApiProperty({ required: false, description: '成本价快照' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiProperty({
    required: false,
    description: '毛利（仅有权用户可传，后端会重算）',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  profit?: number;
}

export class CreateQuotationDto {
  @ApiProperty({ required: false, description: '客户 ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ description: '客户名称（快照）' })
  @IsString()
  @IsNotEmpty({ message: '客户名称不能为空' })
  @MaxLength(200)
  customerName: string;

  @ApiProperty({ required: false, description: '联系人' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerContact?: string;

  @ApiProperty({ required: false, description: '地址' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  customerAddress?: string;

  @ApiProperty({ required: false, description: '报价备注' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  remark?: string;

  @ApiProperty({ required: false, description: '报价模板 ID' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiProperty({ required: false, description: '税率（%）' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;

  @ApiProperty({ required: false, enum: QuotationStatus, description: '状态' })
  @IsOptional()
  @IsEnum(QuotationStatus)
  status?: QuotationStatus;

  @ApiProperty({ type: [QuotationItemDto], description: '报价明细' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items: QuotationItemDto[];
}

export class UpdateQuotationStatusDto {
  @ApiProperty({ enum: QuotationStatus })
  @IsEnum(QuotationStatus)
  status: QuotationStatus;
}

export class QuotationFilterDto extends PaginationDto {
  @ApiProperty({ required: false, enum: QuotationStatus })
  @IsOptional()
  @IsEnum(QuotationStatus)
  status?: QuotationStatus;

  @ApiProperty({ required: false, description: '客户 ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ required: false, description: '客户名称' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({
    required: false,
    description: '版本组 ID（查看某组全部版本）',
  })
  @IsOptional()
  @IsString()
  versionGroupId?: string;
}

export class CreateQuotationTemplateDto {
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

  @ApiProperty({ description: '模板配置 JSON（列配置、标题格式、页眉页脚等）' })
  @IsNotEmpty()
  config: Record<string, unknown>;

  @ApiProperty({ required: false, description: '是否默认模板' })
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateQuotationTemplateDto extends PartialType(
  CreateQuotationTemplateDto,
) {}
