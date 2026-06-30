import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  IsUUID,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNullableUUID } from '../../common/validators/is-nullable-uuid.validator';

// 密码复杂度验证正则：至少包含大小写字母、数字、特殊字符
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'engineer1' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  @MaxLength(50, { message: '用户名不能超过50字符' })
  username: string;

  @ApiProperty({ description: '密码', example: 'SecurePass123!' })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(8, { message: '密码长度至少8位' })
  @MaxLength(100, { message: '密码不能超过100字符' })
  @Matches(PASSWORD_REGEX, {
    message: '密码必须包含大小写字母、数字和特殊字符',
  })
  password: string;

  @ApiProperty({ description: '姓名', example: '张三' })
  @IsString()
  @IsNotEmpty({ message: '姓名不能为空' })
  @MaxLength(50, { message: '姓名不能超过50字符' })
  name: string;

  @ApiProperty({ description: '角色ID' })
  @IsUUID()
  @IsNotEmpty({ message: '角色ID不能为空' })
  roleId: string;

  @ApiProperty({ description: '区域ID', required: false })
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '是否启用', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserDto {
  @ApiProperty({ description: '用户名', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '用户名不能超过50字符' })
  username?: string;

  @ApiProperty({ description: '密码', required: false })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: '密码长度至少8位' })
  @MaxLength(100, { message: '密码不能超过100字符' })
  @Matches(PASSWORD_REGEX, {
    message: '密码必须包含大小写字母、数字和特殊字符',
  })
  password?: string;

  @ApiProperty({ description: '姓名', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '姓名不能超过50字符' })
  name?: string;

  @ApiProperty({ description: '角色ID', required: false })
  @IsOptional()
  @IsUUID()
  roleId?: string;

  @ApiProperty({ description: '区域ID', required: false })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (value === '' ? null : value))
  @IsNullableUUID({ message: '区域ID必须是有效的UUID或为空' })
  regionId?: string | null;

  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProfileDto {
  @ApiProperty({ description: '姓名', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: '旧密码' })
  @IsString()
  @IsNotEmpty({ message: '旧密码不能为空' })
  oldPassword: string;

  @ApiProperty({ description: '新密码' })
  @IsString()
  @IsNotEmpty({ message: '新密码不能为空' })
  @MinLength(8, { message: '密码长度至少8位' })
  @MaxLength(100, { message: '密码不能超过100字符' })
  @Matches(PASSWORD_REGEX, {
    message: '新密码必须包含大小写字母、数字和特殊字符',
  })
  newPassword: string;
}
