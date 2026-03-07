import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ description: '接收用户ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: '通知类型' })
  @IsString()
  type: string;

  @ApiProperty({ description: '标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '内容' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '关联工单ID' })
  @IsOptional()
  @IsUUID()
  workOrderId?: string;
}

export class MarkReadDto {
  @ApiProperty({ description: '通知ID列表' })
  @IsUUID('4', { each: true })
  ids: string[];
}
