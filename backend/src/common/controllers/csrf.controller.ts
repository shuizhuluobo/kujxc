import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CsrfService } from '../services/csrf.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('安全')
@Controller('security')
export class CsrfController {
  constructor(private readonly csrfService: CsrfService) {}

  @Get('csrf-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取CSRF Token' })
  @ApiResponse({ status: 200, description: '返回CSRF Token' })
  getCsrfToken() {
    const token = this.csrfService.generateToken();
    return { token };
  }
}
