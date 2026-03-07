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
import { ServiceTypesService } from './service-types.service';
import { CreateServiceTypeDto, UpdateServiceTypeDto } from '../common/dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('服务类型管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('service-types')
export class ServiceTypesController {
  constructor(private readonly serviceTypesService: ServiceTypesService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('*')
  @ApiOperation({ summary: '创建服务类型' })
  create(@Body() createDto: CreateServiceTypeDto) {
    return this.serviceTypesService.create(createDto);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('serviceType:list')
  @ApiOperation({ summary: '获取所有服务类型' })
  findAll() {
    return this.serviceTypesService.findAll();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('serviceType:view')
  @ApiOperation({ summary: '获取指定服务类型' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceTypesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('*')
  @ApiOperation({ summary: '更新服务类型' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateServiceTypeDto,
  ) {
    return this.serviceTypesService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('*')
  @ApiOperation({ summary: '删除服务类型' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceTypesService.remove(id);
  }
}
