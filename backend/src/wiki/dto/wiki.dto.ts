import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateWikiCategoryDto {
  @ApiProperty({ description: '分类名称' })
  @IsString()
  @IsNotEmpty({ message: '分类名称不能为空' })
  name: string;

  @ApiProperty({ description: '排序', required: false, default: 0 })
  @IsInt()
  @IsOptional()
  @Min(0)
  sortOrder?: number;

  @ApiProperty({ description: '父级分类ID', required: false })
  @IsUUID()
  @IsOptional()
  parentId?: string;
}

export class UpdateWikiCategoryDto extends PartialType(CreateWikiCategoryDto) { }

export class CreateWikiTagDto {
  @ApiProperty({ description: '标签名称' })
  @IsString()
  @IsNotEmpty({ message: '标签名称不能为空' })
  name: string;
}

export class WikiAttachmentDto {
  @ApiProperty({ description: '文件名' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ description: '文件URL' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ description: '文件大小 (bytes)' })
  @IsInt()
  size: number;

  @ApiProperty({ description: 'MIME类型' })
  @IsString()
  mimeType: string;
}

export class CreateWikiArticleDto {
  @ApiProperty({ description: '标题' })
  @IsString()
  @IsNotEmpty({ message: '标题不能为空' })
  title: string;

  @ApiProperty({ description: '内容' })
  @IsString()
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;

  @ApiProperty({ description: '分类ID' })
  @IsUUID()
  @IsNotEmpty({ message: '必须选择分类' })
  categoryId: string;

  @ApiProperty({ description: '标签名称列表', required: false })
  @IsString({ each: true })
  @IsOptional()
  tagNames?: string[];

  @ApiProperty({ description: '是否公开', default: true })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({
    description: '附件列表',
    type: [WikiAttachmentDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => WikiAttachmentDto)
  attachments?: WikiAttachmentDto[];
}

export class UpdateWikiArticleDto extends PartialType(CreateWikiArticleDto) { }

import { PaginationDto } from '../../common/dto';

export class WikiArticleFilterDto extends PaginationDto {
  // keyword is inherited from PaginationDto

  @ApiProperty({ description: '分类ID', required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ description: '标签名称', required: false })
  @IsString()
  @IsOptional()
  tagName?: string;

  @ApiProperty({ description: '作者ID', required: false })
  @IsUUID()
  @IsOptional()
  authorId?: string;
}
