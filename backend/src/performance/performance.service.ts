import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CalculationType,
  Prisma,
  ProjectMemberRole,
  StageTrackingMode,
} from '@prisma/client';
import * as ExcelJS from 'exceljs';

// Raw SQL 查询结果类型（PostgreSQL 列名保留大小写，但代码中部分以小写访问）
interface CustomerDeviceRow {
  id: string;
  projectId: string;
  customerId: string;
  deviceName: string;
  devicename: string;
  expectedQuantity: number;
  expectedquantity: number;
  remark: string | null;
  createdAt: Date;
  creatorId: string;
}

interface DeviceStageProgressRow {
  id: string;
  deviceId: string;
  stageId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

// 全局统计用户聚合类型
interface GlobalUserStats {
  userId: string;
  userName: string;
  totalQuantity: number;
  totalAmount: number;
  totalWorkDays: number;
  workDaysAmount: number;
  projectCount: Set<string>;
}

// 导出统计行类型（动态阶段列通过索引签名）
interface StatsExportRow {
  userName: string;
  totalWorkDays: string;
  workDaysAmount: string;
  totalAmount: string;
  [key: string]: string;
}

export interface StageInput {
  id?: string;
  name: string;
  code: string;
  trackingMode: StageTrackingMode;
  unitPrice: number;
  sortOrder?: number;
}

export interface CreateProjectDto {
  projectName: string;
  calculationType: CalculationType;
  totalQuantity?: number;
  dailyPrice: number;
  remark?: string;
  memberIds?: string[];
  stages?: StageInput[];
}

export interface UpdateProjectDto {
  projectName?: string;
  totalQuantity?: number;
  dailyPrice?: number;
  remark?: string;
  memberIds?: string[];
  stages?: StageInput[];
}

export interface CreateRecordDto {
  stageId?: string;
  quantity?: number;
  customerId?: string;
  workHours?: number;
  description?: string;
  date: string;
  collaboratorIds: string[];
  includeRecorder: boolean;
  remark?: string;
  deviceId?: string;
}

// 批量记录（单设备 + 多选阶段，每个阶段单独数量，受设备剩余量限制）
// 例如：设备应送5台、已送2台（送货剩3），批量勾选 送货/安装/调试，
// 送货最多填3，安装/调试各自最多填5；超出剩余量的部分不自动记录，需手动单选补记。
export interface CreateRecordsDto {
  deviceId: string;
  entries: { stageId: string; quantity: number }[];
  date: string;
  collaboratorIds: string[];
  includeRecorder: boolean;
  remark?: string;
}

export interface UpdateRecordDto {
  stageId?: string;
  quantity?: number;
  customerId?: string;
  workHours?: number;
  description?: string;
  date?: string;
  collaboratorIds?: string[];
  includeRecorder?: boolean;
  remark?: string;
  deviceId?: string;
}

export interface StageStat {
  count: number;
  amount: number;
}

export interface PerformanceResult {
  userId: string;
  userName: string;
  stageStats: Record<string, StageStat>;
  totalWorkDays: number;
  workDaysAmount: number;
  totalAmount: number;
}

export interface MyPerformanceStats {
  stageStats: Record<string, StageStat>;
  totalWorkDays: number;
  totalAmount: number;
}

// 默认阶段模板
export const DEFAULT_STAGES: StageInput[] = [
  {
    name: '送货',
    code: 'delivery',
    trackingMode: StageTrackingMode.DEVICE,
    unitPrice: 0,
    sortOrder: 0,
  },
  {
    name: '安装',
    code: 'install',
    trackingMode: StageTrackingMode.DEVICE,
    unitPrice: 0,
    sortOrder: 1,
  },
  {
    name: '调试',
    code: 'debug',
    trackingMode: StageTrackingMode.DEVICE,
    unitPrice: 0,
    sortOrder: 2,
  },
];

@Injectable()
export class PerformanceService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  // ============ 阶段校验 ============
  validateStages(stages: StageInput[]): string | null {
    if (stages.length === 0) return '按量项目至少需要一个阶段';
    const names = new Set<string>();
    const codes = new Set<string>();
    for (const s of stages) {
      if (!s.name?.trim()) return '阶段名称不能为空';
      if (!s.code?.trim()) return '阶段编码不能为空';
      if (names.has(s.name)) return `阶段名称"${s.name}"重复`;
      if (codes.has(s.code)) return `阶段编码"${s.code}"重复`;
      names.add(s.name);
      codes.add(s.code);
    }
    return null;
  }

  // ============ 项目查询 ============
  async getProjects(userId?: string, isAdmin?: boolean) {
    const where: Prisma.PerformanceProjectWhereInput = {};
    if (userId && !isAdmin) {
      where.OR = [{ creatorId: userId }, { members: { some: { userId } } }];
    }
    return this.prisma.performanceProject.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true } },
        members: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { joinedAt: 'asc' },
        },
        stages: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async getProject(id: string) {
    return this.prisma.performanceProject.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true } },
        members: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { joinedAt: 'asc' },
        },
        stages: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async isProjectMember(projectId: string, userId: string): Promise<boolean> {
    const project = await this.prisma.performanceProject.findUnique({
      where: { id: projectId },
      select: { creatorId: true },
    });
    if (!project) return false;
    if (project.creatorId === userId) return true;
    const member = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    return !!member;
  }

  async assertProjectMember(
    projectId: string,
    userId: string,
    roleCode?: string,
  ) {
    if (roleCode === 'admin') return;
    const isMember = await this.isProjectMember(projectId, userId);
    if (!isMember) {
      throw new ForbiddenException('您不是该项目的参与人员，无法进行此操作');
    }
  }

  async assertProjectManager(
    projectId: string,
    userId: string,
    roleCode?: string,
  ) {
    if (roleCode === 'admin') return;
    const project = await this.prisma.performanceProject.findUnique({
      where: { id: projectId },
      select: { creatorId: true },
    });
    if (!project) throw new NotFoundException('项目不存在');
    if (project.creatorId !== userId) {
      throw new ForbiddenException('只有项目创建人或管理员可以执行此操作');
    }
  }

  // ============ 项目 CRUD ============
  async createProject(data: CreateProjectDto, creatorId: string) {
    const { memberIds, stages, ...projectData } = data;
    const members = memberIds || [];
    const uniqueMemberIds = [
      ...new Set(members.filter((id) => id !== creatorId)),
    ];

    // 按量项目校验阶段
    if (projectData.calculationType === CalculationType.QUANTITY) {
      const stageList = stages && stages.length > 0 ? stages : DEFAULT_STAGES;
      const err = this.validateStages(stageList);
      if (err) throw new BadRequestException(err);
    }

    return this.prisma.performanceProject.create({
      data: {
        ...projectData,
        creatorId,
        members: {
          create: [
            { userId: creatorId, role: ProjectMemberRole.OWNER },
            ...uniqueMemberIds.map((userId) => ({
              userId,
              role: ProjectMemberRole.MEMBER,
            })),
          ],
        },
        stages:
          projectData.calculationType === CalculationType.QUANTITY
            ? {
                create: (stages && stages.length > 0
                  ? stages
                  : DEFAULT_STAGES
                ).map((s, idx) => ({
                  name: s.name,
                  code: s.code,
                  trackingMode: s.trackingMode,
                  unitPrice: s.unitPrice,
                  sortOrder: s.sortOrder ?? idx,
                })),
              }
            : undefined,
      },
      include: {
        creator: { select: { id: true, name: true } },
        members: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { joinedAt: 'asc' },
        },
        stages: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async updateProject(id: string, data: UpdateProjectDto) {
    const { memberIds, stages, ...projectData } = data;

    // 阶段校验（仅按量项目应传入 stages；类型创建后不可改，此处不依赖 projectData.calculationType）
    if (stages !== undefined) {
      const err = this.validateStages(stages);
      if (err) throw new BadRequestException(err);
    }

    return this.prisma.$transaction(async (tx) => {
      // 成员同步
      if (memberIds !== undefined) {
        await tx.projectMember.deleteMany({ where: { projectId: id } });
        const project = await tx.performanceProject.findUnique({
          where: { id },
        });
        const creatorId = project?.creatorId || '';
        const uniqueMemberIds = [
          ...new Set(memberIds.filter((uid) => uid !== creatorId)),
        ];
        await tx.projectMember.createMany({
          data: [
            { projectId: id, userId: creatorId, role: ProjectMemberRole.OWNER },
            ...uniqueMemberIds.map((userId) => ({
              projectId: id,
              userId,
              role: ProjectMemberRole.MEMBER,
            })),
          ],
        });
      }

      // 阶段同步（增删改）
      if (stages !== undefined) {
        const existing = await tx.projectStage.findMany({
          where: { projectId: id },
        });
        const existingMap = new Map(existing.map((s) => [s.id, s]));
        const keepIds = new Set(stages.filter((s) => s.id).map((s) => s.id!));

        // 删除不再存在的阶段（关联记录 stageId 置空）
        const toDelete = existing.filter((s) => !keepIds.has(s.id));
        for (const s of toDelete) {
          await tx.projectStage.delete({ where: { id: s.id } });
        }

        // 更新现有 + 新增
        for (let idx = 0; idx < stages.length; idx++) {
          const s = stages[idx];
          if (s.id && existingMap.has(s.id)) {
            await tx.projectStage.update({
              where: { id: s.id },
              data: {
                name: s.name,
                code: s.code,
                trackingMode: s.trackingMode,
                unitPrice: s.unitPrice,
                sortOrder: s.sortOrder ?? idx,
              },
            });
          } else {
            await tx.projectStage.create({
              data: {
                projectId: id,
                name: s.name,
                code: s.code,
                trackingMode: s.trackingMode,
                unitPrice: s.unitPrice,
                sortOrder: s.sortOrder ?? idx,
              },
            });
          }
        }
      }

      return tx.performanceProject.update({
        where: { id },
        data: projectData,
        include: {
          creator: { select: { id: true, name: true } },
          members: {
            include: { user: { select: { id: true, name: true } } },
            orderBy: { joinedAt: 'asc' },
          },
          stages: { orderBy: { sortOrder: 'asc' } },
        },
      });
    });
  }

  async deleteProject(id: string) {
    return this.prisma.performanceProject.delete({
      where: { id },
    });
  }

  // ============ 记录查询 ============
  async getRecords(projectId: string) {
    const records = await this.prisma.performanceRecord.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true, shortName: true } },
        stage: {
          select: {
            id: true,
            name: true,
            code: true,
            trackingMode: true,
            unitPrice: true,
          },
        },
      },
    });

    const allCollaboratorIds = [
      ...new Set(records.flatMap((r) => r.collaboratorIds)),
    ];
    const collaborators = await this.prisma.user.findMany({
      where: { id: { in: allCollaboratorIds } },
      select: { id: true, name: true },
    });
    const collaboratorMap = new Map(collaborators.map((c) => [c.id, c]));

    return records.map((record) => ({
      ...record,
      collaborators: record.collaboratorIds.map(
        (id) => collaboratorMap.get(id) || { id, name: '未知' },
      ),
    }));
  }

  async getRecord(projectId: string, recordId: string) {
    const record = await this.prisma.performanceRecord.findFirst({
      where: { id: recordId, projectId },
    });
    if (!record) {
      throw new NotFoundException('记录不存在');
    }
    return record;
  }

  // ============ 记录创建（统一入口，支持动态阶段）============
  async createRecord(
    projectId: string,
    data: CreateRecordDto,
    creatorId: string,
    roleCode?: string,
  ) {
    await this.assertProjectMember(projectId, creatorId, roleCode);

    const project = await this.prisma.performanceProject.findUnique({
      where: { id: projectId },
      include: { stages: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!project) throw new NotFoundException('项目不存在');

    // 按量项目：必须有阶段
    if (project.calculationType === CalculationType.QUANTITY) {
      if (!data.stageId) throw new BadRequestException('请选择阶段');
      const stage = project.stages.find((s) => s.id === data.stageId);
      if (!stage) throw new BadRequestException('阶段不存在');

      // DEVICE 模式：必须关联设备
      if (stage.trackingMode === StageTrackingMode.DEVICE) {
        if (!data.deviceId) throw new BadRequestException('该阶段需关联设备');
        if (!data.quantity || data.quantity <= 0)
          throw new BadRequestException('数量必须大于0');
      }
    }

    const record = await this.prisma.$transaction(async (tx) => {
      // DEVICE 模式阶段：校验设备上限并更新进度
      if (data.stageId && data.deviceId && data.quantity) {
        const stage = project.stages.find((s) => s.id === data.stageId);
        if (stage && stage.trackingMode === StageTrackingMode.DEVICE) {
          // 加行锁
          const [lockedDevice] = await tx.$queryRaw<CustomerDeviceRow[]>`
            SELECT * FROM "CustomerDevice" WHERE id = ${data.deviceId} FOR UPDATE
          `;
          if (!lockedDevice) throw new NotFoundException('设备不存在');

          const customer = lockedDevice.customerId
            ? await tx.customer.findUnique({
                where: { id: lockedDevice.customerId },
              })
            : null;

          // 当前阶段已记录数量
          const [progress] = await tx.$queryRaw<DeviceStageProgressRow[]>`
            SELECT * FROM "DeviceStageProgress" WHERE "deviceId" = ${data.deviceId} AND "stageId" = ${data.stageId} FOR UPDATE
          `;
          const currentQty = progress?.quantity || 0;
          const newQty = currentQty + data.quantity;

          if (newQty > lockedDevice.expectedQuantity) {
            const expectedQuantity =
              lockedDevice.expectedQuantity ??
              lockedDevice.expectedquantity ??
              0;
            throw new BadRequestException(
              `${stage.name}数量超出限制：${customer?.name || '该客户'}的${lockedDevice.deviceName || lockedDevice.devicename}应${expectedQuantity}台，已记录${currentQty}台，本次提交${data.quantity}台将超出总量`,
            );
          }

          // 更新或创建进度
          if (progress) {
            await tx.deviceStageProgress.update({
              where: { id: progress.id },
              data: { quantity: newQty },
            });
          } else {
            await tx.deviceStageProgress.create({
              data: {
                deviceId: data.deviceId,
                stageId: data.stageId,
                quantity: newQty,
              },
            });
          }
        }
      }

      // 创建记录
      return tx.performanceRecord.create({
        data: {
          projectId,
          stageId: data.stageId,
          quantity: data.quantity,
          customerId: data.customerId,
          workHours: data.workHours,
          description: data.description,
          date: data.date,
          collaboratorIds: data.collaboratorIds,
          includeRecorder: data.includeRecorder,
          remark: data.remark,
          deviceId: data.deviceId,
          creatorId,
        },
        include: {
          creator: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true, shortName: true } },
          stage: {
            select: {
              id: true,
              name: true,
              code: true,
              trackingMode: true,
              unitPrice: true,
            },
          },
        },
      });
    });

    // SSE 通知
    if (record.deviceId) {
      this.emitDeviceChanged(projectId, record.deviceId);
    }
    return record;
  }

  // ============ 批量记录（单设备 + 多选阶段，每个阶段单独数量）============
  // 业务逻辑：针对单台设备，勾选多个阶段并分别填写数量；每个阶段的数量不得超过
  // 该设备在该阶段的剩余量（应送量-已记）。前端已限制每个阶段的数量上限，后端再做兜底：
  // 超出剩余量的部分不自动记录，需用户手动单选补记；剩余量为 0 或数量无效的阶段直接跳过。
  async createRecords(
    projectId: string,
    dto: CreateRecordsDto,
    creatorId: string,
    roleCode?: string,
  ) {
    if (!dto.deviceId) {
      throw new BadRequestException('请选择设备');
    }
    if (!Array.isArray(dto.entries) || dto.entries.length === 0) {
      throw new BadRequestException('请至少选择一个阶段');
    }
    // 按阶段去重，避免同一阶段被重复记录
    const seenStages = new Set<string>();
    const entries = dto.entries.filter((e) => {
      if (!e || !e.stageId || seenStages.has(e.stageId)) return false;
      seenStages.add(e.stageId);
      return true;
    });
    if (entries.length === 0) {
      throw new BadRequestException('请至少选择一个有效阶段');
    }
    await this.assertProjectMember(projectId, creatorId, roleCode);

    const project = await this.prisma.performanceProject.findUnique({
      where: { id: projectId },
      include: { stages: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!project) throw new NotFoundException('项目不存在');
    if (project.calculationType !== CalculationType.QUANTITY) {
      throw new BadRequestException('仅按量项目支持批量记录');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 加行锁锁定设备，获取客户与应送量
      const [lockedDevice] = await tx.$queryRaw<CustomerDeviceRow[]>`
        SELECT * FROM "CustomerDevice" WHERE id = ${dto.deviceId} FOR UPDATE
      `;
      if (!lockedDevice) {
        throw new NotFoundException('设备不存在');
      }

      const created: Array<{ id: string; deviceId?: string | null }> = [];
      const summary = { recorded: 0, applied: 0, skipped: 0 };

      for (const entry of entries) {
        const stage = project.stages.find((s) => s.id === entry.stageId);
        // 阶段不存在或非设备跟踪模式，跳过
        if (!stage || stage.trackingMode !== StageTrackingMode.DEVICE) {
          summary.skipped += 1;
          continue;
        }

        const qty = Math.floor(Number(entry.quantity));
        if (!Number.isFinite(qty) || qty < 1) {
          summary.skipped += 1;
          continue;
        }

        const [progress] = await tx.$queryRaw<DeviceStageProgressRow[]>`
          SELECT * FROM "DeviceStageProgress" WHERE "deviceId" = ${lockedDevice.id} AND "stageId" = ${stage.id} FOR UPDATE
        `;
        const currentQty = progress?.quantity || 0;
        const expectedQuantity =
          lockedDevice.expectedQuantity ?? lockedDevice.expectedquantity ?? 0;
        const remaining = expectedQuantity - currentQty;

        // 该阶段已完成（无剩余量）或数量超出，均跳过，需用户手动单选补记
        if (remaining <= 0) {
          summary.skipped += 1;
          continue;
        }
        const applied = Math.min(qty, remaining);

        if (progress) {
          await tx.deviceStageProgress.update({
            where: { id: progress.id },
            data: { quantity: currentQty + applied },
          });
        } else {
          await tx.deviceStageProgress.create({
            data: {
              deviceId: lockedDevice.id,
              stageId: stage.id,
              quantity: applied,
            },
          });
        }
        const rec = await tx.performanceRecord.create({
          data: {
            projectId,
            stageId: stage.id,
            quantity: applied,
            customerId: lockedDevice.customerId,
            date: dto.date,
            collaboratorIds: dto.collaboratorIds,
            includeRecorder: dto.includeRecorder,
            remark: dto.remark,
            deviceId: lockedDevice.id,
            creatorId,
          },
        });
        created.push(rec);
        summary.recorded += 1;
        summary.applied += applied;
      }

      return { created, summary };
    });

    // SSE 通知
    result.created.forEach((r) => {
      if (r.deviceId) this.emitDeviceChanged(projectId, r.deviceId);
    });
    return result;
  }

  // ============ 记录更新 ============
  async updateRecord(
    projectId: string,
    recordId: string,
    data: UpdateRecordDto,
  ) {
    const oldRecord = await this.prisma.performanceRecord.findUnique({
      where: { id: recordId },
    });
    if (!oldRecord) throw new NotFoundException('记录不存在');

    const qtyChanged =
      data.quantity !== undefined && data.quantity !== oldRecord.quantity;
    const stageChanged =
      data.stageId !== undefined && data.stageId !== oldRecord.stageId;
    const deviceId = oldRecord.deviceId;

    // 涉及设备进度变动，需事务同步
    if (deviceId && (qtyChanged || stageChanged) && oldRecord.stageId) {
      const result = await this.prisma.$transaction(async (tx) => {
        const [device] = await tx.$queryRaw<CustomerDeviceRow[]>`
          SELECT * FROM "CustomerDevice" WHERE id = ${deviceId} FOR UPDATE
        `;
        if (!device) {
          return tx.performanceRecord.update({
            where: { id: recordId },
            data,
            include: {
              creator: { select: { id: true, name: true } },
              customer: { select: { id: true, name: true, shortName: true } },
              stage: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  trackingMode: true,
                  unitPrice: true,
                },
              },
            },
          });
        }

        // 1. 回退旧阶段进度
        const oldStageId = oldRecord.stageId;
        const oldQty = oldRecord.quantity || 0;
        if (oldQty > 0) {
          const [oldProgress] = await tx.$queryRaw<DeviceStageProgressRow[]>`
            SELECT * FROM "DeviceStageProgress" WHERE "deviceId" = ${deviceId} AND "stageId" = ${oldStageId} FOR UPDATE
          `;
          if (oldProgress) {
            const backQty = Math.max(0, oldProgress.quantity - oldQty);
            await tx.deviceStageProgress.update({
              where: { id: oldProgress.id },
              data: { quantity: backQty },
            });
          }
        }

        // 2. 增加新阶段进度（如果新阶段也是 DEVICE 模式）
        const newStageId = data.stageId ?? oldRecord.stageId;
        const newQty =
          data.quantity !== undefined ? data.quantity : oldRecord.quantity || 0;

        if (newStageId && newQty > 0) {
          const stage = await tx.projectStage.findUnique({
            where: { id: newStageId },
          });
          if (stage && stage.trackingMode === StageTrackingMode.DEVICE) {
            const [newProgress] = await tx.$queryRaw<DeviceStageProgressRow[]>`
              SELECT * FROM "DeviceStageProgress" WHERE "deviceId" = ${deviceId} AND "stageId" = ${newStageId} FOR UPDATE
            `;
            const currentQty = newProgress?.quantity || 0;
            const finalQty = currentQty + newQty;
            if (finalQty > device.expectedQuantity) {
              const expectedQuantity =
                device.expectedQuantity ?? device.expectedquantity ?? 0;
              throw new BadRequestException(
                `${stage.name}数量超出限制：${device.deviceName || device.devicename}应${expectedQuantity}台，本次提交${newQty}台将超出总量`,
              );
            }
            if (newProgress) {
              await tx.deviceStageProgress.update({
                where: { id: newProgress.id },
                data: { quantity: finalQty },
              });
            } else {
              await tx.deviceStageProgress.create({
                data: { deviceId, stageId: newStageId, quantity: finalQty },
              });
            }
          }
        }

        return tx.performanceRecord.update({
          where: { id: recordId },
          data,
          include: {
            creator: { select: { id: true, name: true } },
            customer: { select: { id: true, name: true, shortName: true } },
            stage: {
              select: {
                id: true,
                name: true,
                code: true,
                trackingMode: true,
                unitPrice: true,
              },
            },
          },
        });
      });
      this.emitDeviceChanged(projectId, deviceId);
      return result;
    }

    return this.prisma.performanceRecord.update({
      where: { id: recordId },
      data,
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true, shortName: true } },
        stage: {
          select: {
            id: true,
            name: true,
            code: true,
            trackingMode: true,
            unitPrice: true,
          },
        },
      },
    });
  }

  // ============ 记录删除 ============
  async deleteRecord(projectId: string, recordId: string) {
    const record = await this.prisma.performanceRecord.findUnique({
      where: { id: recordId },
    });
    if (!record) throw new NotFoundException('记录不存在');

    if (record.deviceId && record.stageId && record.quantity) {
      const deviceId = record.deviceId;
      await this.prisma.$transaction(async (tx) => {
        const [device] = await tx.$queryRaw<CustomerDeviceRow[]>`
          SELECT * FROM "CustomerDevice" WHERE id = ${deviceId} FOR UPDATE
        `;
        if (!device) {
          await tx.performanceRecord.delete({ where: { id: recordId } });
          return;
        }

        // 回退阶段进度
        const [progress] = await tx.$queryRaw<DeviceStageProgressRow[]>`
          SELECT * FROM "DeviceStageProgress" WHERE "deviceId" = ${deviceId} AND "stageId" = ${record.stageId} FOR UPDATE
        `;
        if (progress) {
          const backQty = Math.max(
            0,
            progress.quantity - (record.quantity || 0),
          );
          await tx.deviceStageProgress.update({
            where: { id: progress.id },
            data: { quantity: backQty },
          });
        }

        await tx.performanceRecord.delete({ where: { id: recordId } });
      });
      this.emitDeviceChanged(projectId, deviceId);
      return;
    }

    return this.prisma.performanceRecord.delete({
      where: { id: recordId },
    });
  }

  // ============ 设备管理 ============
  async getDevices(projectId: string) {
    return this.prisma.customerDevice.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true, shortName: true } },
        project: { select: { id: true, projectName: true } },
        stageProgress: true,
      },
    });
  }

  async createDevice(
    projectId: string,
    data: {
      customerId: string;
      deviceName: string;
      expectedQuantity: number;
      remark?: string;
    },
    creatorId: string,
    roleCode?: string,
  ) {
    await this.assertProjectManager(projectId, creatorId, roleCode);
    const device = await this.prisma.$transaction(async (tx) => {
      const created = await tx.customerDevice.create({
        data: {
          ...data,
          projectId,
          creatorId,
        },
        include: {
          creator: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true, shortName: true } },
          stageProgress: true,
        },
      });
      await this.recalculateProjectTotalQuantity(tx, projectId);
      return created;
    });
    this.emitDeviceChanged(projectId, device.id);
    return device;
  }

  async updateDevice(
    deviceId: string,
    data: {
      customerId?: string;
      deviceName?: string;
      expectedQuantity?: number;
      remark?: string;
    },
    userId?: string,
    roleCode?: string,
  ) {
    let projectId: string | undefined;
    if (userId) {
      const device = await this.prisma.customerDevice.findUnique({
        where: { id: deviceId },
        select: { projectId: true },
      });
      if (device) {
        projectId = device.projectId;
        await this.assertProjectManager(device.projectId, userId, roleCode);
      }
    }
    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.customerDevice.update({
        where: { id: deviceId },
        data,
        include: {
          creator: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true, shortName: true } },
          stageProgress: true,
        },
      });
      if (projectId) {
        await this.recalculateProjectTotalQuantity(tx, projectId);
      }
      return updated;
    });
    if (projectId) this.emitDeviceChanged(projectId, deviceId);
    return result;
  }

  async deleteDevice(deviceId: string, userId?: string, roleCode?: string) {
    let projectId: string | undefined;
    if (userId) {
      const device = await this.prisma.customerDevice.findUnique({
        where: { id: deviceId },
        select: { projectId: true },
      });
      if (device) {
        projectId = device.projectId;
        await this.assertProjectManager(device.projectId, userId, roleCode);
      }
    }
    const result = await this.prisma.$transaction(async (tx) => {
      const deleted = await tx.customerDevice.delete({
        where: { id: deviceId },
      });
      if (projectId) {
        await this.recalculateProjectTotalQuantity(tx, projectId);
      }
      return deleted;
    });
    if (projectId) this.emitDeviceChanged(projectId, deviceId);
    return result;
  }

  // 触发设备变更 SSE 事件
  private emitDeviceChanged(projectId: string, deviceId?: string) {
    this.eventEmitter.emit('app.event', {
      type: 'performance.device.changed',
      payload: { projectId, deviceId },
    });
  }

  // 根据设备清单重新计算项目总量
  private async recalculateProjectTotalQuantity(
    tx: Prisma.TransactionClient,
    projectId: string,
  ) {
    const result = await tx.customerDevice.aggregate({
      where: { projectId },
      _sum: { expectedQuantity: true },
    });
    const total = result._sum.expectedQuantity || 0;
    await tx.performanceProject.update({
      where: { id: projectId },
      data: { totalQuantity: total },
    });
  }

  // ============ 统计：单项目 ============
  async getStats(projectId: string): Promise<PerformanceResult[]> {
    const project = await this.prisma.performanceProject.findUnique({
      where: { id: projectId },
      include: { stages: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!project) return [];

    const records = await this.prisma.performanceRecord.findMany({
      where: { projectId },
      include: { creator: { select: { id: true, name: true } } },
    });

    const userStats = new Map<string, PerformanceResult>();

    const ensureUser = (userId: string, userName: string) => {
      if (!userStats.has(userId)) {
        userStats.set(userId, {
          userId,
          userName,
          stageStats: {},
          totalWorkDays: 0,
          workDaysAmount: 0,
          totalAmount: 0,
        });
      }
      return userStats.get(userId)!;
    };

    records.forEach((record) => {
      const allUserIds: string[] = [...record.collaboratorIds];
      if (record.includeRecorder) allUserIds.push(record.creatorId);
      const userCount = allUserIds.length || 1;

      allUserIds.forEach((userId) => {
        const stats = ensureUser(
          userId,
          userId === record.creatorId ? record.creator.name : '',
        );

        if (
          project.calculationType === CalculationType.QUANTITY &&
          record.quantity &&
          record.stageId
        ) {
          const stage = project.stages.find((s) => s.id === record.stageId);
          if (stage) {
            const quantityPerUser = record.quantity / userCount;
            if (!stats.stageStats[stage.id]) {
              stats.stageStats[stage.id] = { count: 0, amount: 0 };
            }
            stats.stageStats[stage.id].count += quantityPerUser;
            stats.stageStats[stage.id].amount +=
              quantityPerUser * stage.unitPrice;
          }
        } else if (
          project.calculationType === CalculationType.DAILY &&
          record.workHours
        ) {
          const totalWorkDays = record.workHours / 8;
          stats.totalWorkDays += totalWorkDays;
          stats.workDaysAmount += totalWorkDays * project.dailyPrice;
        }
      });
    });

    // 补全用户名
    const users = await this.prisma.user.findMany({
      where: { id: { in: Array.from(userStats.keys()) } },
      select: { id: true, name: true },
    });
    users.forEach((u) => {
      const stats = userStats.get(u.id);
      if (stats) stats.userName = u.name;
    });

    return Array.from(userStats.values()).map((stat) => {
      let stageTotal = 0;
      Object.values(stat.stageStats).forEach((s) => {
        s.count = Math.round(s.count * 100) / 100;
        stageTotal += s.amount;
      });
      return {
        ...stat,
        totalAmount: Math.round((stageTotal + stat.workDaysAmount) * 100) / 100,
      };
    });
  }

  // ============ 统计：我的 ============
  async getMyStats(
    projectId: string,
    userId: string,
  ): Promise<MyPerformanceStats> {
    const project = await this.prisma.performanceProject.findUnique({
      where: { id: projectId },
      include: { stages: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!project) {
      return { stageStats: {}, totalWorkDays: 0, totalAmount: 0 };
    }

    const records = await this.prisma.performanceRecord.findMany({
      where: {
        projectId,
        OR: [
          { collaboratorIds: { has: userId } },
          { creatorId: userId, includeRecorder: true },
        ],
      },
    });

    const result: MyPerformanceStats = {
      stageStats: {},
      totalWorkDays: 0,
      totalAmount: 0,
    };

    records.forEach((record) => {
      const allUserIds: string[] = [...record.collaboratorIds];
      if (record.includeRecorder) allUserIds.push(record.creatorId);
      const userCount = allUserIds.length || 1;

      if (
        project.calculationType === CalculationType.QUANTITY &&
        record.quantity &&
        record.stageId
      ) {
        const stage = project.stages.find((s) => s.id === record.stageId);
        if (stage) {
          const quantityPerUser = record.quantity / userCount;
          if (!result.stageStats[stage.id])
            result.stageStats[stage.id] = { count: 0, amount: 0 };
          result.stageStats[stage.id].count += quantityPerUser;
          result.stageStats[stage.id].amount +=
            quantityPerUser * stage.unitPrice;
        }
      } else if (
        project.calculationType === CalculationType.DAILY &&
        record.workHours
      ) {
        result.totalWorkDays += record.workHours / 8;
        result.totalAmount += (record.workHours / 8) * project.dailyPrice;
      }
    });

    let stageTotal = 0;
    Object.values(result.stageStats).forEach((s) => {
      s.count = Math.round(s.count * 100) / 100;
      stageTotal += s.amount;
    });
    result.totalAmount =
      Math.round((stageTotal + result.totalWorkDays * 0) * 100) / 100;
    // 注意：DAILY 项目的 totalAmount 已在循环中累加；QUANTITY 的金额在 stageStats 中
    // 统一：totalAmount = 阶段金额合计 + 日结金额
    let workDaysAmount = 0;
    if (project.calculationType === CalculationType.DAILY) {
      records.forEach((record) => {
        if (record.workHours) {
          const allUserIds: string[] = [...record.collaboratorIds];
          if (record.includeRecorder) allUserIds.push(record.creatorId);
          workDaysAmount += ((record.workHours / 8) * project.dailyPrice) / 1;
        }
      });
    }
    result.totalAmount = Math.round((stageTotal + workDaysAmount) * 100) / 100;
    result.totalWorkDays = Math.round(result.totalWorkDays * 100) / 100;

    return result;
  }

  // ============ 导出：单项目 ============
  async exportProject(projectId: string): Promise<Buffer> {
    const project = await this.prisma.performanceProject.findUnique({
      where: { id: projectId },
      include: {
        stages: { orderBy: { sortOrder: 'asc' } },
        records: {
          include: { customer: true, creator: true, stage: true },
          orderBy: { date: 'desc' },
        },
        creator: true,
      },
    });
    if (!project) throw new Error('项目不存在');

    const workbook = new ExcelJS.Workbook();

    // 工作记录（放在最前，确保导出的首要内容是工作记录）
    const recordSheet = workbook.addWorksheet('工作记录');
    recordSheet.columns = [
      { header: '日期', key: 'date', width: 12 },
      { header: '阶段', key: 'stage', width: 10 },
      { header: '数量/工时', key: 'quantity', width: 12 },
      { header: '客户', key: 'customer', width: 20 },
      { header: '协作人员', key: 'collaborators', width: 25 },
      { header: '包含记录人', key: 'includeRecorder', width: 10 },
      { header: '描述/备注', key: 'description', width: 30 },
      { header: '记录人', key: 'creator', width: 12 },
    ];
    recordSheet.getRow(1).font = { bold: true };
    recordSheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    const collaborators = await this.prisma.user.findMany({
      where: {
        id: {
          in: [...new Set(project.records.flatMap((r) => r.collaboratorIds))],
        },
      },
    });
    const collaboratorMap = new Map(collaborators.map((c) => [c.id, c.name]));

    project.records.forEach((record) => {
      const quantityOrHours = record.quantity
        ? `${record.quantity}台`
        : record.workHours
          ? `${record.workHours}小时 (${(record.workHours / 8).toFixed(1)}工日)`
          : '-';
      recordSheet.addRow({
        date: new Date(record.date).toLocaleDateString('zh-CN'),
        stage: record.stage?.name || '-',
        quantity: quantityOrHours,
        customer: record.customer?.name || '-',
        collaborators: record.collaboratorIds
          .map((id) => collaboratorMap.get(id) || id)
          .join(', '),
        includeRecorder: record.includeRecorder ? '是' : '否',
        description: record.description || record.remark || '-',
        creator: record.creator?.name || '-',
      });
    });

    // 项目信息
    const infoSheet = workbook.addWorksheet('项目信息');
    infoSheet.columns = [
      { header: '项目信息', key: 'label', width: 20 },
      { header: '内容', key: 'value', width: 40 },
    ];
    infoSheet.getRow(1).font = { bold: true };
    infoSheet.addRow({ label: '项目名称', value: project.projectName });
    infoSheet.addRow({
      label: '计算方式',
      value:
        project.calculationType === 'QUANTITY' ? '按数量计算' : '按工日计算',
    });
    infoSheet.addRow({
      label: '设备总量',
      value: project.totalQuantity || '-',
    });
    if (project.calculationType === 'QUANTITY') {
      project.stages.forEach((s) => {
        infoSheet.addRow({
          label: `${s.name}单价`,
          value: `${s.unitPrice}元/台`,
        });
      });
    }
    infoSheet.addRow({
      label: '日结单价',
      value: `${project.dailyPrice}元/人/工日`,
    });
    infoSheet.addRow({ label: '备注', value: project.remark || '-' });
    infoSheet.addRow({ label: '创建人', value: project.creator?.name || '-' });
    infoSheet.addRow({
      label: '创建时间',
      value: new Date(project.createdAt).toLocaleString('zh-CN'),
    });

    // 工作量统计（动态阶段列）
    const stats = await this.getStats(projectId);
    const statsSheet = workbook.addWorksheet('工作量统计');
    const statsColumns: Partial<ExcelJS.Column>[] = [
      { header: '参与人员', key: 'userName', width: 15 },
    ];
    if (project.calculationType === 'QUANTITY') {
      project.stages.forEach((s) => {
        statsColumns.push({
          header: `${s.name}数量`,
          key: `${s.id}_count`,
          width: 12,
        });
        statsColumns.push({
          header: `${s.name}金额`,
          key: `${s.id}_amount`,
          width: 12,
        });
      });
    }
    statsColumns.push({ header: '工日数', key: 'totalWorkDays', width: 12 });
    statsColumns.push({ header: '日结金额', key: 'workDaysAmount', width: 12 });
    statsColumns.push({ header: '合计金额', key: 'totalAmount', width: 12 });
    statsSheet.columns = statsColumns;
    statsSheet.getRow(1).font = { bold: true };
    statsSheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    stats.forEach((stat) => {
      const row: StatsExportRow = { userName: stat.userName } as StatsExportRow;
      if (project.calculationType === 'QUANTITY') {
        project.stages.forEach((s) => {
          const ss = stat.stageStats[s.id];
          row[`${s.id}_count`] = ss ? ss.count.toFixed(2) : '0.00';
          row[`${s.id}_amount`] = ss ? `${ss.amount.toFixed(2)}元` : '0.00元';
        });
      }
      row.totalWorkDays = stat.totalWorkDays.toFixed(2);
      row.workDaysAmount = `${stat.workDaysAmount.toFixed(2)}元`;
      row.totalAmount = `${stat.totalAmount.toFixed(2)}元`;
      statsSheet.addRow(row);
    });

    // 合计行
    const totalRow: StatsExportRow = { userName: '合计' } as StatsExportRow;
    if (project.calculationType === 'QUANTITY') {
      project.stages.forEach((s) => {
        totalRow[`${s.id}_count`] = stats
          .reduce((sum, st) => sum + (st.stageStats[s.id]?.count || 0), 0)
          .toFixed(2);
        totalRow[`${s.id}_amount`] =
          `${stats.reduce((sum, st) => sum + (st.stageStats[s.id]?.amount || 0), 0).toFixed(2)}元`;
      });
    }
    totalRow.totalWorkDays = stats
      .reduce((sum, s) => sum + s.totalWorkDays, 0)
      .toFixed(2);
    totalRow.workDaysAmount = `${stats.reduce((sum, s) => sum + s.workDaysAmount, 0).toFixed(2)}元`;
    totalRow.totalAmount = `${stats.reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}元`;
    const tRow = statsSheet.addRow(totalRow);
    tRow.font = { bold: true };

    return workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  // ============ 导出：多项目 ============
  async exportProjects(projectIds?: string[]): Promise<Buffer> {
    const where =
      projectIds && projectIds.length > 0 ? { id: { in: projectIds } } : {};
    const projects = await this.prisma.performanceProject.findMany({
      where,
      include: {
        stages: { orderBy: { sortOrder: 'asc' } },
        records: { include: { customer: true, stage: true } },
        creator: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const summarySheet = workbook.addWorksheet('项目汇总');
    summarySheet.columns = [
      { header: '项目名称', key: 'projectName', width: 25 },
      { header: '计算方式', key: 'calculationType', width: 12 },
      { header: '设备总量', key: 'totalQuantity', width: 12 },
      { header: '记录数', key: 'recordCount', width: 10 },
      { header: '创建人', key: 'creator', width: 12 },
      { header: '创建时间', key: 'createdAt', width: 18 },
    ];
    summarySheet.getRow(1).font = { bold: true };

    const allUserIds = [
      ...new Set(
        projects.flatMap((p) => [
          p.creatorId,
          ...p.records.flatMap((r) => r.collaboratorIds),
        ]),
      ),
    ];
    const users = await this.prisma.user.findMany({
      where: { id: { in: allUserIds } },
    });
    const userMap = new Map(users.map((u) => [u.id, u.name]));

    projects.forEach((project) => {
      summarySheet.addRow({
        projectName: project.projectName,
        calculationType:
          project.calculationType === 'QUANTITY' ? '按数量计算' : '按工日计算',
        totalQuantity: project.totalQuantity || '-',
        recordCount: project.records.length,
        creator: userMap.get(project.creatorId) || '-',
        createdAt: new Date(project.createdAt).toLocaleString('zh-CN'),
      });

      const detailSheet = workbook.addWorksheet(
        project.projectName.length > 30
          ? project.projectName.substring(0, 30)
          : project.projectName,
      );
      detailSheet.columns = [
        { header: '日期', key: 'date', width: 12 },
        { header: '阶段', key: 'stage', width: 10 },
        { header: '数量/工时', key: 'quantity', width: 12 },
        { header: '客户', key: 'customer', width: 20 },
        { header: '协作人员', key: 'collaborators', width: 25 },
        { header: '金额', key: 'amount', width: 12 },
      ];
      detailSheet.getRow(1).font = { bold: true };

      const stageMap = new Map(project.stages.map((s) => [s.id, s]));

      project.records.forEach((record) => {
        let amount = 0;
        if (
          project.calculationType === CalculationType.QUANTITY &&
          record.quantity &&
          record.stageId
        ) {
          const stage = stageMap.get(record.stageId);
          if (stage) {
            const userCount =
              [
                ...record.collaboratorIds,
                ...(record.includeRecorder ? [record.creatorId] : []),
              ].length || 1;
            amount = (record.quantity / userCount) * stage.unitPrice;
          }
        } else if (
          project.calculationType === CalculationType.DAILY &&
          record.workHours
        ) {
          amount = (record.workHours / 8) * project.dailyPrice;
        }
        detailSheet.addRow({
          date: new Date(record.date).toLocaleDateString('zh-CN'),
          stage: record.stage?.name || '-',
          quantity: record.quantity
            ? `${record.quantity}台`
            : record.workHours
              ? `${record.workHours}小时`
              : '-',
          customer: record.customer?.name || '-',
          collaborators: record.collaboratorIds
            .map((id) => userMap.get(id) || id)
            .join(', '),
          amount: `${amount.toFixed(2)}元`,
        });
      });
    });

    return workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  // ============ 费用记录 ============
  async getFeeRecords(projectId?: string) {
    return this.prisma.feeRecord.findMany({
      where: projectId ? { projectId } : { projectId: null },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true, shortName: true } },
      },
    });
  }

  async saveFeeRecord(
    projectId: string | null,
    data: {
      items: any[];
      subtotal: number;
      discount: number;
      actualAmount: number;
      remark?: string;
      customerId?: string;
      collaboratorIds?: string[];
    },
    creatorId: string,
  ) {
    return this.prisma.feeRecord.create({
      data: {
        projectId: projectId || null,
        customerId: data.customerId,
        items: data.items,
        subtotal: data.subtotal,
        discount: data.discount,
        actualAmount: data.actualAmount,
        remark: data.remark,
        creatorId,
        collaboratorIds: data.collaboratorIds || [],
      },
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true, shortName: true } },
      },
    });
  }

  async deleteFeeRecord(projectId: string | null, recordId: string) {
    const record = await this.prisma.feeRecord.findFirst({
      where: projectId
        ? { id: recordId, projectId }
        : { id: recordId, projectId: null },
    });
    if (!record) throw new NotFoundException('费用记录不存在');
    return this.prisma.feeRecord.delete({ where: { id: recordId } });
  }

  // ============ 全局统计（跨项目，阶段不跨项目对齐，仅汇总总数量/金额）============
  async getGlobalStats(startDate?: string, endDate?: string, userId?: string) {
    const dateFilter: Prisma.StringFilter = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;
    const recordWhere: Prisma.PerformanceRecordWhereInput = {};
    if (startDate || endDate) recordWhere.date = dateFilter;

    const projects = await this.prisma.performanceProject.findMany({
      include: {
        stages: true,
        records: {
          where: Object.keys(recordWhere).length > 0 ? recordWhere : undefined,
          include: { creator: { select: { id: true, name: true } } },
        },
      },
    });

    const userStats = new Map<string, GlobalUserStats>();

    for (const project of projects) {
      const stageMap = new Map(project.stages.map((s) => [s.id, s]));
      for (const record of project.records) {
        const allUserIds: string[] = [...record.collaboratorIds];
        if (record.includeRecorder) allUserIds.push(record.creatorId);
        const userCount = allUserIds.length || 1;

        for (const uid of allUserIds) {
          if (userId && uid !== userId) continue;
          if (!userStats.has(uid)) {
            userStats.set(uid, {
              userId: uid,
              userName: uid === record.creatorId ? record.creator.name : '',
              totalQuantity: 0,
              totalAmount: 0,
              totalWorkDays: 0,
              workDaysAmount: 0,
              projectCount: new Set(),
            });
          }
          const stats = userStats.get(uid)!;
          stats.projectCount.add(project.id);

          if (
            project.calculationType === CalculationType.QUANTITY &&
            record.quantity &&
            record.stageId
          ) {
            const stage = stageMap.get(record.stageId);
            if (stage) {
              const quantityPerUser = record.quantity / userCount;
              stats.totalQuantity += quantityPerUser;
              stats.totalAmount += quantityPerUser * stage.unitPrice;
            }
          } else if (
            project.calculationType === CalculationType.DAILY &&
            record.workHours
          ) {
            const totalWorkDays = record.workHours / 8;
            stats.totalWorkDays += totalWorkDays;
            stats.workDaysAmount += totalWorkDays * project.dailyPrice;
          }
        }
      }
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: Array.from(userStats.keys()) } },
      select: { id: true, name: true },
    });
    users.forEach((u) => {
      const stats = userStats.get(u.id);
      if (stats) stats.userName = u.name;
    });

    return Array.from(userStats.values()).map((stat) => ({
      userId: stat.userId,
      userName: stat.userName,
      projectCount: stat.projectCount.size,
      totalQuantity: Math.round(stat.totalQuantity * 100) / 100,
      totalWorkDays: Math.round(stat.totalWorkDays * 100) / 100,
      workDaysAmount: Math.round(stat.workDaysAmount * 100) / 100,
      totalAmount:
        Math.round((stat.totalAmount + stat.workDaysAmount) * 100) / 100,
    }));
  }
}
