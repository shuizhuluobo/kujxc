import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StockCheckItemDto {
  @ApiProperty({ description: '产品ID' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: '实际盘点数量' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  actualQuantity: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

export class CreateStockCheckDto {
  @ApiPropertyOptional({ description: '盘点备注' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remark?: string;

  @ApiProperty({ description: '盘点明细', type: [StockCheckItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockCheckItemDto)
  items: StockCheckItemDto[];
}
