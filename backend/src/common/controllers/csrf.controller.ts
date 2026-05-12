import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CsrfService } from '../services/csrf.service';
import { Public } from '../decorators/public.decorator';

@ApiTags('安全')
@Controller('security')
export class CsrfController {
  constructor(private readonly csrfService: CsrfService) {}

  @Get('csrf-token')
  @Public()
  @ApiOperation({ summary: '获取CSRF Token' })
  @ApiResponse({ status: 200, description: '返回CSRF Token' })
  async getCsrfToken() {
    const token = await this.csrfService.generateToken();
    return { token };
  }
}
