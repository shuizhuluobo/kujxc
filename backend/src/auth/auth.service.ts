import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto';

export interface JwtPayload {
  sub: string;
  username: string;
  roleCode: string;
  roleId: string;
  permissions: string[];
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('用户不存在或已禁用');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('密码错误');
    }

    // Check if user is using default password (must be configured via environment variable)
    const defaultPassword = this.configService.get<string>('DEFAULT_PASSWORD');
    const isDefaultPassword = defaultPassword
      ? await bcrypt.compare(defaultPassword, user.password)
      : false;

    const { password: _, ...result } = user;
    return { ...result, isDefaultPassword };
  }

  private extractPermissions(role: { permissions: unknown }): string[] {
    if (Array.isArray(role.permissions)) {
      return role.permissions as string[];
    }
    return [];
  }

  async login(loginDto: LoginDto) {
    const { isDefaultPassword, ...user } = await this.validateUser(
      loginDto.username,
      loginDto.password,
    );
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user,
      mustChangePassword: isDefaultPassword,
    };
  }

  async generateTokens(user: {
    id: string;
    username: string;
    role: { code: string; id: string; permissions: unknown };
  }): Promise<TokenResponse> {
    const permissions = this.extractPermissions(user.role);
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      roleCode: user.role.code,
      roleId: user.role.id,
      permissions,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('用户不存在或已禁用');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
