import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, MaxLength, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateWarehouseDto {
  @ApiProperty({ description: '仓库名称' })
  @IsString()
  @IsNotEmpty({ message: '仓库名称不能为空' })
  @MaxLength(100)
  name: string;

  @ApiProperty({ required: false, description: '关联区域ID' })
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @ApiProperty({ required: false, description: '仓库类型：总库/分库/样品库' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;
}

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {}

export class WarehouseFilterDto extends PaginationDto {}
