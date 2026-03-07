import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称', example: '管理员' })
  @IsString()
  @IsNotEmpty({ message: '角色名称不能为空' })
  name: string;

  @ApiProperty({ description: '角色代码', example: 'admin' })
  @IsString()
  @IsNotEmpty({ message: '角色代码不能为空' })
  code: string;

  @ApiProperty({
    description: '权限列表（权限编码数组）',
    type: [String],
    required: false,
    example: ['workOrder:create', 'workOrder:view'],
  })
  @IsOptional()
  @IsArray()
  permissions?: string[];

  @ApiProperty({
    description: '权限矩阵（模块-权限映射）',
    required: false,
    example: { workOrder: ['create', 'view'], customer: ['view'] },
  })
  @IsOptional()
  @IsObject()
  permissionMatrix?: Record<string, string[]>;
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

export class PermissionMatrixDto {
  @ApiProperty({ description: '模块key', example: 'workOrder' })
  @IsString()
  moduleKey: string;

  @ApiProperty({
    description: '页面权限',
    type: [String],
    example: ['pending', 'history'],
  })
  @IsArray()
  pages: string[];

  @ApiProperty({
    description: '操作权限',
    type: [String],
    example: ['create', 'edit', 'delete'],
  })
  @IsArray()
  actions: string[];
}
