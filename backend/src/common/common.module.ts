import { Module, Global } from '@nestjs/common';
import { CsrfService } from './services/csrf.service';
import { FilesService } from './services/files.service';
import { CodeGeneratorService } from './services/code-generator.service';
import { CsrfGuard } from './guards/csrf.guard';
import { CsrfController } from './controllers/csrf.controller';

@Global()
@Module({
  controllers: [CsrfController],
  providers: [CsrfService, FilesService, CodeGeneratorService, CsrfGuard],
  exports: [CsrfService, FilesService, CodeGeneratorService, CsrfGuard],
})
export class CommonModule {}
