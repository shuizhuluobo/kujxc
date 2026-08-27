import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryImportService } from './inventory-import.service';
import { InventoryController } from './inventory.controller';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, InventoryImportService],
  exports: [InventoryService, InventoryImportService],
})
export class InventoryModule {}
