import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsInt, Min, Max } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateSupplierDto {
  @ApiProperty({ description: '供应商名称' })
  @IsString()
  @IsNotEmpty({ message: '供应商名称不能为空' })
  @MaxLength(100)
  name: string;

  @ApiProperty({ required: false, description: '联系人' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contact?: string;

  @ApiProperty({ required: false, description: '电话' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiProperty({ required: false, description: '地址' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiProperty({ required: false, description: '开户行' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @ApiProperty({ required: false, description: '银行账号' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  bankAccount?: string;

  @ApiProperty({ required: false, description: '户名' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  accountName?: string;

  @ApiProperty({ required: false, description: '付款方式' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentMethod?: string;
}

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}

export class SupplierFilterDto extends PaginationDto {
  @ApiProperty({ required: false, description: '排序字段', enum: ['createdAt', 'name'] })
  @IsOptional()
  @IsString()
  orderBy?: 'createdAt' | 'name';
}
