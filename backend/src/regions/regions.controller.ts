import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RegionsService } from './regions.service';
import { CreateRegionDto, UpdateRegionDto } from '../common/dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CsrfProtected } from '../common/decorators/csrf-token.decorator';

@ApiTags('区域管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('*')
  @ApiOperation({ summary: '创建区域' })
  create(@Body() createDto: CreateRegionDto) {
    return this.regionsService.create(createDto);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('region:list')
  @ApiOperation({ summary: '获取所有区域' })
  findAll() {
    return this.regionsService.findAll();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('region:view')
  @ApiOperation({ summary: '获取指定区域' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.regionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('*')
  @ApiOperation({ summary: '更新区域' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateRegionDto,
  ) {
    return this.regionsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('*')
  @ApiOperation({ summary: '删除区域' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.regionsService.remove(id);
  }
}
