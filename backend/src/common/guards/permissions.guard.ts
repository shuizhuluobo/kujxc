import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

interface UserWithPermissions {
  roleId: string;
  permissions?: string[];
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as UserWithPermissions;

    if (!user || !user.roleId) {
      throw new ForbiddenException('用户信息无效');
    }

    // 从JWT payload获取缓存的权限（避免数据库查询）
    const userPermissions = user.permissions || [];

    // 检查是否有任意一个权限（或关系）
    const hasPermission = requiredPermissions.some((permission) => {
      // 超级管理员通配符
      if (userPermissions.includes('*')) {
        return true;
      }
      // 直接匹配
      if (userPermissions.includes(permission)) {
        return true;
      }
      // 模块通配符匹配（如 workOrder:*）
      const [module] = permission.split(':');
      if (userPermissions.includes(`${module}:*`)) {
        return true;
      }
      return false;
    });

    if (!hasPermission) {
      throw new ForbiddenException('权限不足');
    }

    return true;
  }
}
