# 任务拆解 — kujxc 进销存 MVP (垂直切片)

> 基于 `docs/design-inventory.md` | 每任务可独立演示 `后端API+前端ElPlus+Excel导入+校验` | 0学习成本校验为DoD

## 里程碑

- **M0 基座**：`kujxc:main fef148e` 已就绪
- **M1 主档+批次**：库存可见
- **M2 入库+库存查询**：可导入Excel并查询 `kccx`
- **M3 销售审核FIFO**：端到端 `入库->销售->扣库存` 严格FIFO
- **M4 调拨/退货/盘点**：全单据闭环
- **M5 并行验证+扩展预留**：双写对账，后续借用/联动不阻塞切换

## 任务清单

### Phase1 MVP — 必须，阻塞切换

| # | 任务 | 产出 | 关联Legacy | 工期 |
|---|---|---|---|---|
| T1 | Prisma 模型 + Migration：Warehouse/InventoryBatch/Stock/CostExclusion/Sale* | `backend/prisma/schema.prisma` migrate | `入库单/j_rk` `t_pcb` `销售单/明细/批次` | 2d |
| T2 | 主档复用：Customer类型扩展(供应商/客户) + Warehouse CRUD + 权限 `inventory:*` | `backend/src/warehouses` `frontend/src/views/inventory/WarehousesView.vue` | `cnc_jgglb` `gys/kh` | 2d |
| T3 | 入库单：下拨单+入库单 合并为 `StockInOrder` (标志/到货/库保) + Excel导入 | `backend/src/inventory/stock-in` `frontend StockInList/Edit` | `spxb/srk` `sprk_manage/edit` | 4d |
| T4 | 库存查询 `kccx`：汇总 `sum(quantityRem)` `sum(quantityRem*unitPrice)` + 批次钻取 + 导出 | `backend/src/inventory/stock` API + `frontend StockQueryView` | `kccx_query/edit` | 3d |
| T5 | 销售出库：`StockOutOrder` 建单 + 选批次 `spselect` + 未审核列表 | `backend/src/inventory/stock-out` `frontend StockOutEdit` | `xsck_manage/edit/addmx` | 3d |
| T6 | 审核FIFO：`allocateSale` 严格FIFO `FOR UPDATE` + SaleAllocation + 库存回滚 | `backend/src/inventory/allocations` + 单测 | `NewFolder1/cksh_edit` 完整版 | 4d |
| T7 | 调拨 `spdb/dqspdb`：扣源建目标仓批次 + 总账占位 | `backend/src/inventory/transfers` | `spdb_edit/dqspdb` | 3d |
| T8 | 退货 `thrk/xsth`：负SaleAllocation + BatchAdjustment(客退) | `backend/src/inventory/returns` | `thrk_edit` | 3d |
| T9 | 盘点 `kcpd`：`InventoryCheck` 快照 + 实际库存录入 + 差异报表 | `backend/src/inventory/checks` | `kcpd_manage` | 2d |
| T10 | 影子校验：Excel全量导入 + 日对账 `sum` 对比脚本 + 灰度切换开关 | `scripts/verify-stock.ts` | - | 2d |

### Phase2 扩展 — 不阻塞切换，设计已预留

| # | 任务 | 说明 | 状态 |
|---|---|---|---|
| T11 | 借用管理 `BorrowOrder` | 外勤借备件/工具 `BORROWED/RETURNED/OVERDUE` 独立模块，`type=BORROW` 走批次，不改库存核心 | **Deferred**，仅建表+路由占位 |
| T12 | 销售-出库-工单联动 | `StockOutOrder.workOrderId FK WorkOrder` 可空，销售审核/工单完结双向联动，后续加 | **Deferred** |
| T13 | 打印/对账报表 `khdzd/gysdzd` | `pdfmake` 套打，`对账` 用视图 + 对账状态 | Deferred |

## 处置建议

- **现在补充**：仅在 `设计文档:5 联动扩展点` 定义接口与FK可空，不写业务逻辑，避免MVP风险膨胀。
- **后续增加**：T11/T12 作为 `Phase2` 紧接切换后 2-3周迭代，`BorrowOrder` 复用 `StockLedger`，`联动` 复用 `SaleAllocation`，无重构。

## DoD (0学习成本)

- 字段名/编号/状态文案与Legacy一致，操作路径 `sprk_manage -> sprk_edit` 1:1
- 导入Excel后 `kccx` 数量/金额与老库 `sum` 误差 0
- `cksh` 审核 FIFO 拆批可追溯 `SaleAllocation` 明细
- `e2e` 覆盖 `入库->销售->调拨->退货->盘点` 回放

## 下一步

- 按 T1 开始 `prisma migrate dev`，你提供 `产品/客户/入库单` 三表Excel样例即开T3导入
