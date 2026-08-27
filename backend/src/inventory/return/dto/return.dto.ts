import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReturnDto {
  @ApiProperty({ description: '产品ID' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: '退货数量' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiPropertyOptional({ description: '关联销售单ID（可选）' })
  @IsOptional()
  @IsString()
  saleOrderId?: string;

  @ApiPropertyOptional({ description: '备注/原因' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remark?: string;
}
