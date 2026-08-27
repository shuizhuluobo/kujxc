import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryImportService } from './inventory-import.service';
import { InventoryController } from './inventory.controller';
import { InventoryFifoService } from './inventory-fifo.service';
import { SaleService } from './sale/sale.service';
import { SaleController } from './sale/sale.controller';
import { TransferService } from './transfer/transfer.service';
import { TransferController } from './transfer/transfer.controller';
import { ReturnService } from './return/return.service';
import { ReturnController } from './return/return.controller';
import { StockCheckService } from './check/check.service';
import { StockCheckController } from './check/check.controller';

@Module({
  controllers: [
    InventoryController,
    SaleController,
    TransferController,
    ReturnController,
    StockCheckController,
  ],
  providers: [
    InventoryService,
    InventoryImportService,
    InventoryFifoService,
    SaleService,
    TransferService,
    ReturnService,
    StockCheckService,
  ],
  exports: [
    InventoryService,
    InventoryImportService,
    InventoryFifoService,
    SaleService,
    TransferService,
    ReturnService,
    StockCheckService,
  ],
})
export class InventoryModule {}
