# 进销存现代化设计文档 — kujxc (基于 kworkorder + legacy逆向)

> 基座：`kujxc:main` = `kworkorder:7730551` + `legacy/` | 目标：**0学习成本平滑切换**，UI可变但术语/流程/字段/校验与老系统一致，生产并行不影响 `https://github.com/shuizhuluobo/kujxc`

## 1. 目标与约束

- **复刻范围 MVP**：`下拨单/入库单 -> 库存查询(kccx) -> 销售单/cksh审核 -> 调拨(spdb/dqspdb) -> 退货(thrk/xsth)` + `盘点(kcpd)` + `借用管理(新增)` + `销售-出库-工单联动(新增)`；弃 `front/CMS` `message` `admin/Info` `Asp/ET99`。
- **0学习成本**：保留中文表名/字段名映射、单据编号规则 `Getbm("rkid","入库单",yyyyMMdd,4)`、状态机 `标志/到货确认/库保确认/审核通过/确认到货/单据标志`、操作顺序与校验文案。
- **不影响生产**：老系统 `legacy/` 持续运行，新系统影子并行，双写校验后按仓库灰度切换。
- **数据**：你清洗为 Excel，后端复用 `backend/src/products/product-import.service.ts` 200行游标导入。

## 2. 领域模型

### 2.1 复用 `backend/prisma/schema.prisma:424`
`Brand/Category/Product(code,namePinyin,model,unit,marketPrice,salePrice,costPrice)` 对应 `产品信息`；`Customer/Region` 对应 `cnc_jgglb + 往来单位`；`Role.permissions Json` + `frontend/src/router/index.ts:208 hasPermission` 扩展 `inventory:*`；`CodeSequence` 对应 `utils.cs:219 serial`。

### 2.2 新增 Inventory 域

```prisma
// 供应商独立（客户已存在 Customer，供应商新增打款信息）
model Supplier { id String @id @default(uuid()) name String @unique contact String? phone String? address String?
  bankName String? bankAccount String? accountName String? paymentMethod String? // 打款信息
  namePinyin String? nameInitials String? createdAt DateTime @default(now()) updatedAt DateTime @updatedAt
  @@index([namePinyin]) }
model Customer { // 已有 schema.prisma:51，仅确认独立导航复用
  // name/contact/phone/address/defaultRegionId 保持
}
model Warehouse { id String @id @default(uuid()) name String @unique regionId String? type String // 总库/分库/样品库（展示用，不作库存隔离）
  stocks Stock[] batches InventoryBatch[] }
model InventoryBatch { // 入库单 rkid — 全局库存，不按仓库隔离
  id String @id // rkid yyyyMMdd+4
  cpid String product Product @relation(fields:[cpid],references:[id])
  warehouseId String? warehouse Warehouse? @relation(fields:[warehouseId],references:[id]) // 可空，仅记录来源
  storeName String? // 保留但不参与FIFO隔离
  quantityIn Decimal @db.Decimal(12,2) // 入库数量
  quantityRem Decimal @db.Decimal(12,2) // 剩余数量 (=剩余-供退+客退)
  unitPrice Decimal @db.Decimal(12,2) // 入库单价 rk62
  purchasePrice Decimal? // 进货价
  receivedAt DateTime // 入库日期
  status String @default("NORMAL") // 单据标志 正常/结转
  supplierId String? supplier Supplier? @relation(fields:[supplierId],references:[id])
  flag String @default("YES") // 下拨单标志
  allocations SaleAllocation[]
  adjustments BatchAdjustment[]
  @@index([cpid, receivedAt]) // 去掉warehouse维度
}
model Stock { // 全局汇总，不按仓库
  productId String @id quantity Decimal @db.Decimal(12,2)
}
model SaleAllocation { // 销售明细批次 FIFO证据 legacy NewFolder1/cksh_edit
  id String @id @default(uuid())
  saleDetailId String saleDetail SaleDetail @relation(fields:[saleDetailId],references:[id])
  batchId String batch InventoryBatch @relation(fields:[batchId],references:[id])
  quantity Decimal @db.Decimal(12,2) // 出库数量
  unitCost Decimal @db.Decimal(12,2) // 进货价快照
  createdAt DateTime @default(now())
}
model CostExclusion { // t_pcb legacy/cbhs/pc_manage
  id Int @id @default(autoincrement())
  cpid String warehouse String // dq
  @@unique([cpid, warehouse])
}
model BorrowOrder { // 新增：借用管理
  id String @id code String @unique status String // BORROWED/RETURNED/OVERDUE
  borrowerId String engineer User @relation(fields:[borrowerId],references:[id])
  productId String batchId String? warehouseId String
  quantity Int expectedReturnAt DateTime? returnedAt DateTime? remark String?
  @@index([borrowerId, status])
}
```

`BatchAdjustment` 记录 `供退/客退` 冲销，替代 `入库单.供退+客退` 字段。

## 3. 核心流程与FIFO

### 3.1 流程图
```
下拨单(草稿否->是) --sprk_edit/sprd_edit--> 入库单(正常,剩余) --kccx--> 库存(剩余-供退+客退)
入库单 --xsck_addmx/spselect选批次--> 销售单明细(未审核) --cksh审核--> 扣批次剩余 -> SaleAllocation(+)
调拨单(dqspdb/spdb) --扣源+新批次(目标仓)--> 入库单
退货单(thrk/xsth) --负SaleAllocation--> BatchAdjustment(客退+)
盘点 地区产品盘点(剩余 vs 实际)
```

### 3.2 FIFO决策 ADR
- **严格FIFO** 按 `cpid + receivedAt ASC` 全局（不按仓库隔离，你确认），`NewFolder1/cksh_edit.aspx.cs:1` 完整版，当前线上简化版 `where rkid=@rkid` 手工批次作废。
- 审核时校验 `sum(销售数量) <= sum(quantityRem)` 全局，不足回滚；循环取 `take=min(need, batch.quantityRem)` 生成 `SaleAllocation`，`decrement quantityRem`，事务 `Prisma.$transaction` + `FOR UPDATE`。
- 成本 `sum(quantityRem*unitPrice)` 分批，非加权平均；`t_pcb` 黑名单排除。
- 退货按 `receivedAt DESC` LIFO回补。

## 4. 单据状态机（保留原文案）

| 单据 | 字段 | 值 | 触发 |
|---|---|---|---|
| 下拨单 | 标志/到货确认/库保确认/付款/发票 | 否->是 / 否->是 / 未付->已付 | spxb_edit/sprk_manage |
| 入库单 | 单据标志 | 正常/结转 | kccx过滤 |
| 销售单 | 审核通过 | 否->是 | cksh_edit.save |
| 调拨单 | 确认到货 | 未->已到 | dbrk_manage |
| 退货单 | 单据状态 | 未完成->完成 | thrk_edit |
| 借用单 | 状态 | 已借->已还/逾期 | 新增 |

## 5. 权限体系 — 复用 kworkorder 现有RBAC（避免翻工）

> 现有实现：`backend/prisma/schema.prisma:11 Role.permissions Json` + `backend/src/common/guards/permissions.guard.ts:20` + `backend/src/auth/jwt.strategy.ts:17` JWT载荷缓存权限 + `frontend/src/config/permissions.ts:9 PermissionModules` + `RolesService`，前后端同源校验。

- **机制**：`Role.permissions: string[]` 存 `module:action` 如 `product:view` `workOrder:receive`，`@Permissions('inventory:approve')` `PermissionsGuard` 校验 `some(perm==required || perm==*: 或 module:*)` `permissions.guard.ts:44`，超管 `'*'`；`JwtStrategy.validate` 将 `permissions` 注入 `request.user`，避免每次查库；前端 `hasPermission/hasAnyPermission` `permissions.ts:286` 控制 `router/index.ts:208` 元权限与按钮显隐，`MainLayout` 侧边栏按 `PermissionModules` 渲染。
- **迁移映射**：Legacy `CNC_glyb/role/glyb_child/qxcdb` 粗粒度菜单 → 新 `Role` 细粒度动作；`cnc_jgglb` 地区已由 `User.regionId` + `Region` 隔离库存，`Inventory` 新增模块即新增 `PermissionModules` 条目，无需改表。
- **本次新增模块**（T1前即定义，后续API/前端直接用）：
  ```ts
  // frontend/src/config/permissions.ts 新增
  SUPPLIER: { key:'supplier', name:'供应商', pages:[{key:'manage',path:'/admin/suppliers'}],
    actions:[{key:'view',name:'查看'},{key:'create',name:'创建'},{key:'edit',name:'编辑'},{key:'delete',name:'删除'}]},
  CUSTOMER: { key:'customer', name:'客户', // 已有，保留独立入口
    actions:[{key:'view',name:'查看'},{key:'create',name:'创建'},{key:'edit',name:'编辑'},{key:'delete',name:'删除'}]},
  INVENTORY: { key:'inventory', name:'进销存', pages:[{key:'stock',path:'/inventory/stock'}],
    actions:[
      {key:'view',name:'查看库存'},{key:'create',name:'新建入库/销售'},{key:'approve',name:'审核'},
      {key:'transfer',name:'调拨'},{key:'return',name:'退货'},{key:'check',name:'盘点'},
      {key:'export',name:'导出'},{key:'viewCost',name:'查看成本'} // 对应 kccx_kcjequery 金额列
    ]},
  WAREHOUSE: { key:'warehouse', actions:[{key:'manage',name:'管理仓库'}]}, // 展示用，不隔离库存
  BORROW: { key:'borrow', actions:[{key:'manage',name:'借用管理'}]}, // Phase2预留
  ```
  后端 `@Permissions('inventory:view','inventory:*')` 装饰 `stock.controller.ts`，前端 `v-if="hasPermission(perms,'inventory:approve')"` 控制 `审核` 按钮，`meta.permission:['inventory:view','inventory:*']` 控制路由。
- **数据级隔离**：库存全局不按仓库隔离，仅 `动作级` 权限；`Warehouse` 仅展示/来源记录，查询 `where cpid=@` 全局；`Supplier` 打款信息仅动作级 `supplier:*` 控制，不作行级隔离；`T1` 即落地 Guard。
- **实施顺序**：T1 前先在 `permissions.ts` 注册模块并 `seed` 默认 `admin/business/engineer` 模板 `RolePermissionTemplates:222` 追加 `inventory:*` 给 admin，`business` 给 `view/create`，后续任务零权限重构。

## 5.1 架构

- **后端** `backend/src/inventory/` 三模块 `warehouses/stock-orders/transfers + borrow`，复用 `CommonModule` `PrismaModule` `AuditLog` `CodeGenerator` `JwtAuthGuard/CsrfGuard/PermissionsGuard` `app.module.ts:30` + `@Permissions` 装饰器。
- **前端** `frontend/src/views/inventory/` 复用 `ProductListView` 的 `el-table/el-pagination/filter` + `pinyin-pro` 拼音搜，路由 `meta.permission: ['inventory:view','inventory:*']` `router/index.ts:84`，按钮级 `hasPermission`。
- **联动扩展点**（Phase2 预留接口，Phase1 不实现）：
  - `BorrowOrder` 类型 `BORROW/RETURN` 走 `StockLedger`，与 `InventoryBatch` 共享批次，权限 `borrow:manage`。
  - `Sale -> StockOut -> WorkOrder`：`StockOutOrder.workOrderId FK WorkOrder.id` `schema.prisma:99`，销售审核生成 `StockOut`，工单完结反写 `维修耗材` 分录，当前仅定义 FK 可空，业务后续加，权限 `inventory:approve` 复用。

## 6. UI 0学习成本映射

| Legacy | 新系统 |
|---|---|
| `sprk_manage DataGrid PageSize 50` `ascx/dgNavigation` | `el-table pagination pageSize 50` 保留列 `入库单号/产品名称/剩余数量/入库单价/仓库名称` |
| `showModalDialog spselect` | `el-dialog + el-select remote-search` 拼音 `namePinyin/nameInitials` |
| `calendar.js` | `el-date-picker` |
| `spxbprint/xsprint` | `pdfmake/docx` 已在 `backend/package.json:58` |

校验文案、必填、编号规则完全一致。

## 7. 迁移与切换

1. **Excel导入**：你自行清洗 `产品/客户/供应商/入库单/库存`（供应商含打款信息 `bankName/bankAccount/accountName/paymentMethod`），按 `product-import.service:303` 游标导入，`rkid` 保留原号。
2. **双写校验**：影子期新旧 `sum(剩余*单价)` `sum(库存数量)` 全局日对账（不按仓库），差异告警。
3. **灰度**：`kworkorder` 生产不动，`kujxc` 独立 `DATABASE_URL`，按 `客户/时间` 切。

## 8. 新增功能处置

- **借用管理**：Phase2 独立迭代，不阻塞MVP切换；设计已预留 `BorrowOrder + StockLedger type=BORROW`，MVP仅建表+路由，不开放。
- **销售-出库-工单联动**：Phase2；MVP销售审核仅扣库存，联动字段 `workOrderId` 可空，后续加 `work-orders` 关联与耗材回写。

## 9. 验证

- 冒烟：`入库->库存查询->销售出库审核(FIFO拆批)->调拨->退货->盘点` 与老库回放对比。
- 单元：`allocateSale FIFO` `Stock FOR UPDATE` `CostExclusion` 排除。

---
*逆向依据：`legacy/webjxc/cbhs/*` `kcgl/*` `xsgl/NewFolder1/cksh_edit` `kccx*` `据流程图.vsd`*
