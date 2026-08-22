import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({ description: '品牌名称' })
  @IsString()
  @IsNotEmpty({ message: '品牌名称不能为空' })
  @MaxLength(50)
  name: string;

  @ApiProperty({ required: false, description: '品牌 Logo URL' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ required: false, description: '品牌描述' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ required: false, description: '排序' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class UpdateBrandDto extends PartialType(CreateBrandDto) {}

export class CreateCategoryDto {
  @ApiProperty({ description: '类型名称' })
  @IsString()
  @IsNotEmpty({ message: '类型名称不能为空' })
  @MaxLength(50)
  name: string;

  @ApiProperty({ required: false, description: '父级类型 ID（空为顶级）' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ required: false, description: '类型描述' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ required: false, description: '排序' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class CreateTagDto {
  @ApiProperty({ description: '标签名称' })
  @IsString()
  @IsNotEmpty({ message: '标签名称不能为空' })
  @MaxLength(50)
  name: string;

  @ApiProperty({ required: false, description: '标签颜色' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @ApiProperty({ required: false, description: '标签描述' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}

export class UpdateTagDto extends PartialType(CreateTagDto) {}
