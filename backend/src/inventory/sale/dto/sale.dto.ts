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

export class SaleDetailDto {
  @ApiProperty({ description: '产品ID (cpid)' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: '数量 quantity', type: Number })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiPropertyOptional({ description: '单价 unitPrice' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({ description: '明细备注' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

export class CreateSaleOrderDto {
  @ApiPropertyOptional({ description: '客户ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  remark?: string;

  @ApiProperty({ description: '明细列表', type: [SaleDetailDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleDetailDto)
  details: SaleDetailDto[];
}

export class ApproveDto {
  @ApiPropertyOptional({ description: '审核备注' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}
