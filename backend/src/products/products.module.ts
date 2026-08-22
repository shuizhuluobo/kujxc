import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { BrandsController } from './brands.controller';
import { CategoriesController } from './categories.controller';
import { ProductTagsController } from './product-tags.controller';
import { QuotationsController } from './quotations.controller';
import { QuotationTemplatesController } from './quotation-templates.controller';
import { ProductImportController } from './product-import.controller';
import { ProductsService } from './products.service';
import { BrandsService } from './brands.service';
import { CategoriesService } from './categories.service';
import { ProductTagsService } from './product-tags.service';
import { QuotationsService } from './quotations.service';
import { QuotationTemplatesService } from './quotation-templates.service';
import { ProductImportService } from './product-import.service';
import { QuotationsDocxService } from './quotations-docx.service';
import { SettingsModule } from '../settings/settings.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [SettingsModule, AuditLogModule],
  controllers: [
    ProductsController,
    BrandsController,
    CategoriesController,
    ProductTagsController,
    QuotationsController,
    QuotationTemplatesController,
    ProductImportController,
  ],
  providers: [
    ProductsService,
    BrandsService,
    CategoriesService,
    ProductTagsService,
    QuotationsService,
    QuotationTemplatesService,
    ProductImportService,
    QuotationsDocxService,
  ],
  exports: [ProductsService, QuotationsService],
})
export class ProductsModule {}
