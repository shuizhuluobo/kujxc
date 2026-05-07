import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  IsInt,
  IsDateString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { WorkOrderStatus, ScoreLevel } from '@prisma/client';

export class CreateWorkOrderDto {
  @ApiProperty({ description: '工单详情' })
  @IsString()
  @IsNotEmpty({ message: '工单详情不能为空' })
  @MaxLength(2000, { message: '工单详情不能超过2000字符' })
  detail: string;

  @ApiProperty({
    description: '分值等级',
    enum: ScoreLevel,
    default: ScoreLevel.NORMAL,
  })
  @IsEnum(ScoreLevel)
  @IsOptional()
  scoreLevel?: ScoreLevel;

  @ApiProperty({ description: '客户ID' })
  @IsUUID()
  @IsNotEmpty({ message: '客户ID不能为空' })
  customerId: string;

  @ApiProperty({ description: '区域ID' })
  @IsUUID()
  @IsNotEmpty({ message: '区域ID不能为空' })
  regionId: string;

  @ApiProperty({ description: '服务类型ID' })
  @IsUUID()
  @IsNotEmpty({ message: '服务类型ID不能为空' })
  serviceTypeId: string;
}

export class UpdateWorkOrderDto extends PartialType(CreateWorkOrderDto) {}

export class CompleteWorkOrderDto {
  @ApiProperty({ description: '协作人ID列表', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  collaboratorIds?: string[];
}

export class WorkOrderFilterDto {
  @ApiProperty({
    description: '工单状态',
    enum: WorkOrderStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;

  @ApiProperty({
    description: '工单状态列表',
    enum: WorkOrderStatus,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(WorkOrderStatus, { each: true })
  @Transform(({ value }): WorkOrderStatus[] | undefined => {
    if (Array.isArray(value)) return value;
    if (value) return [value];
    return value;
  })
  statuses?: WorkOrderStatus[];

  @ApiProperty({ description: '区域ID', required: false })
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @ApiProperty({ description: '服务类型ID', required: false })
  @IsOptional()
  @IsUUID()
  serviceTypeId?: string;

  @ApiProperty({ description: '客户ID', required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ description: '创建人ID', required: false })
  @IsOptional()
  @IsUUID()
  creatorId?: string;

  @ApiProperty({ description: '接收人ID', required: false })
  @IsOptional()
  @IsUUID()
  receiverId?: string;

  @ApiProperty({ description: '完成人ID', required: false })
  @IsOptional()
  @IsUUID()
  completerId?: string;

  @ApiProperty({ description: '开始日期', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: '结束日期', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: '关键词搜索', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  keyword?: string;

  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  @Type(() => Number)
  page?: number;

  @ApiProperty({ description: '每页数量', required: false, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  pageSize?: number;
}
