import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CsrfService } from './services/csrf.service';
import { FilesService } from './services/files.service';
import { CsrfGuard } from './guards/csrf.guard';
import { CsrfController } from './controllers/csrf.controller';

@Global()
@Module({
  controllers: [CsrfController],
  providers: [CsrfService, FilesService, CsrfGuard],
  exports: [CsrfService, FilesService, CsrfGuard],
})
export class CommonModule {}
