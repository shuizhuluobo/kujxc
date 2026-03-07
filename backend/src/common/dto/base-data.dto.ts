import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

// ==================== Customer DTOs ====================
export class CreateCustomerDto {
  @ApiProperty({ description: '客户名称' })
  @IsString()
  @IsNotEmpty({ message: '客户名称不能为空' })
  name: string;

  @ApiProperty({ description: '客户简称', required: false })
  @IsOptional()
  @IsString()
  shortName?: string;

  @ApiProperty({ description: '联系人', required: false })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiProperty({ description: '电话', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '地址', required: false })
  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}

// ==================== Region DTOs ====================
export class CreateRegionDto {
  @ApiProperty({ description: '区域名称', example: '中心' })
  @IsString()
  @IsNotEmpty({ message: '区域名称不能为空' })
  name: string;

  @ApiProperty({ description: '排序', required: false, default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiProperty({ description: '钉钉群机器人 Webhook 地址', required: false })
  @IsOptional()
  @IsString()
  dingtalkWebhook?: string;

  @ApiProperty({ description: '钉钉加签密钥', required: false })
  @IsOptional()
  @IsString()
  dingtalkSecret?: string;
}

export class UpdateRegionDto extends PartialType(CreateRegionDto) {}

// ==================== ServiceType DTOs ====================
export class CreateServiceTypeDto {
  @ApiProperty({ description: '服务类型名称', example: '一般' })
  @IsString()
  @IsNotEmpty({ message: '服务类型名称不能为空' })
  name: string;

  @ApiProperty({ description: '排序', required: false, default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateServiceTypeDto extends PartialType(CreateServiceTypeDto) {}
