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
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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
}

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
  @Min(0)
  @Max(99999)
  quantity: number;

  @ApiProperty({ description: '单价' })
  @IsNumber()
  @Min(0)
  @Max(999999)
  unitPrice: number;
}

export class CalculateFeeDto {
  @ApiProperty({ description: '计费项目列表', type: [FeeCalculateItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeeCalculateItemDto)
  items: FeeCalculateItemDto[];
}

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

  @ApiProperty({ description: '小计', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotal?: number;
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

  @ApiProperty({ description: '创建人ID', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  creatorId?: string;
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
}
