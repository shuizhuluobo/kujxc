import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsInt,
  Min,
  Max,
  MaxLength,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// ==================== 费用设置 DTO ====================

export class CreateFeeSettingDto {
  @ApiProperty({ description: '分类' })
  @IsString()
  @IsNotEmpty({ message: '分类不能为空' })
  @MaxLength(50)
  category: string;

  @ApiProperty({ description: '项目名称' })
  @IsString()
  @IsNotEmpty({ message: '项目名称不能为空' })
  @MaxLength(100)
  item: string;

  @ApiProperty({ description: '单位' })
  @IsString()
  @IsNotEmpty({ message: '单位不能为空' })
  @MaxLength(20)
  unit: string;

  @ApiProperty({ description: '价格' })
  @IsNumber()
  @Min(0)
  @Max(999999)
  price: number;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: '阈值', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  threshold?: number;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateFeeSettingDto {
  @ApiProperty({ description: '价格', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(999999)
  price?: number;

  @ApiProperty({ description: '单位', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

// ==================== 费用计算 DTO ====================

export class FeeCalculateItemDto {
  @ApiProperty({ description: '分类' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category: string;

  @ApiProperty({ description: '项目名称' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  item: string;

  @ApiProperty({ description: '数量' })
  @IsNumber()
  @Min(1)
  @Max(99999)
  quantity: number;
}

export class CalculateFeeDto {
  @ApiProperty({ description: '计费项目列表', type: [FeeCalculateItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeeCalculateItemDto)
  items: FeeCalculateItemDto[];
}

// ==================== 费用记录 DTO ====================

export class FeeRecordItemDto {
  @ApiProperty({ description: '分类' })
  @IsString()
  @MaxLength(50)
  category: string;

  @ApiProperty({ description: '项目名称' })
  @IsString()
  @MaxLength(100)
  item: string;

  @ApiProperty({ description: '数量' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ description: '单价' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: '总计' })
  @IsNumber()
  @Min(0)
  total: number;
}

export class SaveFeeRecordDto {
  @ApiProperty({ description: '费用项目列表', type: [FeeRecordItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeeRecordItemDto)
  items: FeeRecordItemDto[];

  @ApiProperty({ description: '小计金额' })
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiProperty({ description: '折扣金额' })
  @IsNumber()
  @Min(0)
  discount: number;

  @ApiProperty({ description: '实付金额' })
  @IsNumber()
  @Min(0)
  actualAmount: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;

  @ApiProperty({ description: '项目ID', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  projectId?: string;

  @ApiProperty({ description: '客户ID', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  customerId?: string;
}

export class FeeRecordsQueryDto {
  @ApiProperty({ description: '每页数量', required: false, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiProperty({ description: '偏移量', required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  @Type(() => Number)
  offset?: number = 0;

  @ApiProperty({ description: '开始日期', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: '结束日期', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: '创建人ID', required: false })
  @IsOptional()
  @IsString()
  creatorId?: string;

  @ApiProperty({ description: '项目ID', required: false })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({ description: '客户ID', required: false })
  @IsOptional()
  @IsString()
  customerId?: string;
}

export class FeeStatsQueryDto {
  @ApiProperty({ description: '开始日期', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: '结束日期', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
