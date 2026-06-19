import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalculationType, RecordType, ProjectMemberRole, Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';

export interface CreateProjectDto {
  projectName: string;
  calculationType: CalculationType;
  totalQuantity?: number;
  deliveryUnitPrice: number;
  installUnitPrice: number;
  debugUnitPrice: number;
  dailyPrice: number;
  remark?: string;
  memberIds?: string[];
}

export interface UpdateProjectDto {
  projectName?: string;
  totalQuantity?: number;
  deliveryUnitPrice?: number;
  installUnitPrice?: number;
  debugUnitPrice?: number;
  dailyPrice?: number;
  remark?: string;
  memberIds?: string[];
}

export interface CreateRecordDto {
  recordType?: RecordType;
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

export interface UpdateRecordDto {
  recordType?: RecordType;
  quantity?: number;
  customerId?: string;
  workHours?: number;
  description?: string;
  date?: string;
  collaboratorIds?: string[];
  includeRecorder?: boolean;
  remark?: string;
}

export interface PerformanceResult {
  userId: string;
  userName: string;
  deliveryCount: number;
  deliveryAmount: number;
  installCount: number;
  installAmount: number;
  debugCount: number;
  debugAmount: number;
  totalWorkDays: number;
  workDaysAmount: number;
  totalAmount: number;
}

export interface MyPerformanceStats {
  deliveryCount: number;
  installCount: number;
  debugCount: number;
  totalWorkDays: number;
  totalAmount: number;
}

@Injectable()
export class PerformanceService {
  constructor(private prisma: PrismaService) {}

  async getProjects(userId?: string, isAdmin?: boolean) {
    const where: any = {};
    if (userId && !isAdmin) {
      where.OR = [
        { creatorId: userId },
        { members: { some: { userId } } },
      ];
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

  // 校验：管理员或项目创建人或参与人员可操作记录
  async assertProjectMember(projectId: string, userId: string, roleCode?: string) {
    if (roleCode === 'admin') return;
    const isMember = await this.isProjectMember(projectId, userId);
    if (!isMember) {
      throw new ForbiddenException('您不是该项目的参与人员，无法进行此操作');
    }
  }

  // 校验：管理员或项目创建人可管理项目/设备
  async assertProjectManager(projectId: string, userId: string, roleCode?: string) {
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

  async createProject(data: CreateProjectDto & { memberIds?: string[] }, creatorId: string) {
    const { memberIds, ...projectData } = data;
    const members = memberIds || [];
    const uniqueMemberIds = [...new Set(members.filter(id => id !== creatorId))];

    return this.prisma.performanceProject.create({
      data: {
        ...projectData,
        creatorId,
        members: {
          create: [
            { userId: creatorId, role: ProjectMemberRole.OWNER },
            ...uniqueMemberIds.map(userId => ({
              userId,
              role: ProjectMemberRole.MEMBER,
            })),
          ],
        },
      },
      include: {
        creator: { select: { id: true, name: true } },
        members: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });
  }

  async updateProject(id: string, data: UpdateProjectDto & { memberIds?: string[] }) {
    const { memberIds, ...projectData } = data;

    if (memberIds !== undefined) {
      await this.prisma.projectMember.deleteMany({ where: { projectId: id } });
      const project = await this.prisma.performanceProject.findUnique({ where: { id } });
      const creatorId = project?.creatorId || '';
      const uniqueMemberIds = [...new Set(memberIds.filter(uid => uid !== creatorId))];

      await this.prisma.projectMember.createMany({
        data: [
          { projectId: id, userId: creatorId, role: ProjectMemberRole.OWNER },
          ...uniqueMemberIds.map(userId => ({
            projectId: id,
            userId,
            role: ProjectMemberRole.MEMBER,
          })),
        ],
      });
    }

    return this.prisma.performanceProject.update({
      where: { id },
      data: projectData,
      include: {
        creator: { select: { id: true, name: true } },
        members: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });
  }

  async deleteProject(id: string) {
    return this.prisma.performanceProject.delete({
      where: { id },
    });
  }

  async getRecords(projectId: string) {
    const records = await this.prisma.performanceRecord.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });

    const allCollaboratorIds = [...new Set(records.flatMap(r => r.collaboratorIds))];
    const collaborators = await this.prisma.user.findMany({
      where: { id: { in: allCollaboratorIds } },
      select: { id: true, name: true },
    });
    const collaboratorMap = new Map(collaborators.map(c => [c.id, c]));

    return records.map(record => ({
      ...record,
      collaborators: record.collaboratorIds.map(id => collaboratorMap.get(id) || { id, name: '未知' }),
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

  async createRecord(projectId: string, data: CreateRecordDto, creatorId: string, roleCode?: string) {
    // 校验：管理员或项目成员可记录
    await this.assertProjectMember(projectId, creatorId, roleCode);
    // 使用交互式事务：先校验设备数量上限，再创建记录并更新设备
    // 避免校验失败时记录已写入数据库（导致重复记录问题）
    return this.prisma.$transaction(async (tx) => {
      let device: any = null;
      let deviceUpdateData: any = {};

      if (data.deviceId && data.recordType && data.quantity) {
        device = await tx.customerDevice.findUnique({
          where: { id: data.deviceId },
          include: { customer: true },
        });
        if (device) {
          let newQuantity: number;
          switch (data.recordType) {
            case RecordType.DELIVERY:
              newQuantity = device.deliveryQuantity + data.quantity;
              if (newQuantity > device.expectedQuantity) {
                throw new BadRequestException(
                  `送货数量超出限制：${device.customer?.name || '该客户'}的${device.deviceName}应送${device.expectedQuantity}台，已记录送货${device.deliveryQuantity}台，本次提交${data.quantity}台将超出总量`
                );
              }
              deviceUpdateData.deliveryQuantity = newQuantity;
              deviceUpdateData.deliveryBy = creatorId;
              deviceUpdateData.deliveryAt = new Date();
              deviceUpdateData.deliveryCollaborators = data.collaboratorIds;
              break;
            case RecordType.INSTALL:
              newQuantity = device.installQuantity + data.quantity;
              if (newQuantity > device.deliveryQuantity) {
                throw new BadRequestException(
                  `安装数量超出限制：${device.customer?.name || '该客户'}的${device.deviceName}已送货${device.deliveryQuantity}台，已记录安装${device.installQuantity}台，本次提交${data.quantity}台将超出送货数量`
                );
              }
              deviceUpdateData.installQuantity = newQuantity;
              deviceUpdateData.installBy = creatorId;
              deviceUpdateData.installAt = new Date();
              deviceUpdateData.installCollaborators = data.collaboratorIds;
              break;
            case RecordType.DEBUG:
              newQuantity = device.debugQuantity + data.quantity;
              if (newQuantity > device.installQuantity) {
                throw new BadRequestException(
                  `调试数量超出限制：${device.customer?.name || '该客户'}的${device.deviceName}已安装${device.installQuantity}台，已记录调试${device.debugQuantity}台，本次提交${data.quantity}台将超出安装数量`
                );
              }
              deviceUpdateData.debugQuantity = newQuantity;
              deviceUpdateData.debugBy = creatorId;
              deviceUpdateData.debugAt = new Date();
              deviceUpdateData.debugCollaborators = data.collaboratorIds;
              break;
          }

          if (Object.keys(deviceUpdateData).length > 0) {
            const updatedDevice = { ...device, ...deviceUpdateData };
            deviceUpdateData.isCompleted = this.checkCompletion(updatedDevice);
            deviceUpdateData.completedAt = deviceUpdateData.isCompleted ? new Date() : null;
          }
        }
      }

      // 先创建记录
      const record = await tx.performanceRecord.create({
        data: {
          ...data,
          projectId,
          creatorId,
        },
        include: {
          creator: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
        },
      });

      // 再更新设备数量（此时校验已通过）
      if (device && Object.keys(deviceUpdateData).length > 0) {
        await tx.customerDevice.update({
          where: { id: data.deviceId },
          data: deviceUpdateData,
        });
      }

      return record;
    });
  }

  async updateRecord(projectId: string, recordId: string, data: UpdateRecordDto) {
    // 读取旧记录，判断是否需要同步设备数量
    const oldRecord = await this.prisma.performanceRecord.findUnique({
      where: { id: recordId },
    });
    if (!oldRecord) {
      throw new NotFoundException('记录不存在');
    }

    // 如果记录关联设备，且 quantity 或 recordType 发生变化，需要在事务内同步设备数量
    const qtyChanged = data.quantity !== undefined && data.quantity !== oldRecord.quantity;
    const typeChanged = data.recordType !== undefined && data.recordType !== oldRecord.recordType;
    const deviceId = oldRecord.deviceId;

    if (deviceId && (qtyChanged || typeChanged)) {
      return this.prisma.$transaction(async (tx) => {
        const device = await tx.customerDevice.findUnique({
          where: { id: deviceId },
        });
        if (!device) {
          // 设备不存在，直接更新记录
          return tx.performanceRecord.update({
            where: { id: recordId },
            data,
            include: {
              creator: { select: { id: true, name: true } },
              customer: { select: { id: true, name: true } },
            },
          });
        }

        const oldQty = oldRecord.quantity || 0;
        const newQty = data.quantity !== undefined ? data.quantity : oldQty;
        const newType = data.recordType !== undefined ? data.recordType : oldRecord.recordType;
        const oldType = oldRecord.recordType;

        // 1. 回退旧数量（按旧类型）
        const updateData: any = {};
        if (oldType === RecordType.DELIVERY) {
          updateData.deliveryQuantity = Math.max(0, device.deliveryQuantity - oldQty);
        } else if (oldType === RecordType.INSTALL) {
          updateData.installQuantity = Math.max(0, device.installQuantity - oldQty);
        } else if (oldType === RecordType.DEBUG) {
          updateData.debugQuantity = Math.max(0, device.debugQuantity - oldQty);
        }

        // 2. 增加新数量（按新类型），并校验上限
        const projected = { ...device, ...updateData };
        if (newType === RecordType.DELIVERY) {
          const v = (projected.deliveryQuantity || 0) + newQty;
          if (v > device.expectedQuantity) {
            throw new BadRequestException(
              `送货数量超出限制：${device.deviceName}应送${device.expectedQuantity}台，本次提交${newQty}台将超出总量`
            );
          }
          updateData.deliveryQuantity = v;
        } else if (newType === RecordType.INSTALL) {
          const v = (projected.installQuantity || 0) + newQty;
          if (v > (projected.deliveryQuantity || 0)) {
            throw new BadRequestException(
              `安装数量超出限制：${device.deviceName}已送货${projected.deliveryQuantity || 0}台，本次提交${newQty}台将超出送货数量`
            );
          }
          updateData.installQuantity = v;
        } else if (newType === RecordType.DEBUG) {
          const v = (projected.debugQuantity || 0) + newQty;
          if (v > (projected.installQuantity || 0)) {
            throw new BadRequestException(
              `调试数量超出限制：${device.deviceName}已安装${projected.installQuantity || 0}台，本次提交${newQty}台将超出安装数量`
            );
          }
          updateData.debugQuantity = v;
        }

        // 3. 重算完成状态
        const finalDevice = { ...device, ...updateData };
        updateData.isCompleted = this.checkCompletion(finalDevice);
        updateData.completedAt = updateData.isCompleted ? device.completedAt : null;

        await tx.customerDevice.update({
          where: { id: deviceId },
          data: updateData,
        });

        return tx.performanceRecord.update({
          where: { id: recordId },
          data,
          include: {
            creator: { select: { id: true, name: true } },
            customer: { select: { id: true, name: true } },
          },
        });
      });
    }

    return this.prisma.performanceRecord.update({
      where: { id: recordId },
      data,
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });
  }

  async deleteRecord(projectId: string, recordId: string) {
    // 查询要删除的记录，获取关联设备与数量信息
    const record = await this.prisma.performanceRecord.findUnique({
      where: { id: recordId },
    });
    if (!record) {
      throw new NotFoundException('记录不存在');
    }

    // 如果记录关联了设备，需要在事务内回退设备数量
    if (record.deviceId) {
      const deviceId = record.deviceId;
      return this.prisma.$transaction(async (tx) => {
        const device = await tx.customerDevice.findUnique({
          where: { id: deviceId },
        });
        if (!device) {
          await tx.performanceRecord.delete({ where: { id: recordId } });
          return;
        }

        const qty = record.quantity || 0;
        // 按记录类型回退对应阶段数量
        const updateData: any = {};
        if (record.recordType === RecordType.DELIVERY) {
          updateData.deliveryQuantity = Math.max(0, device.deliveryQuantity - qty);
        } else if (record.recordType === RecordType.INSTALL) {
          updateData.installQuantity = Math.max(0, device.installQuantity - qty);
        } else if (record.recordType === RecordType.DEBUG) {
          updateData.debugQuantity = Math.max(0, device.debugQuantity - qty);
        }

        // 重算完成状态
        const updated = {
          ...device,
          ...updateData,
        };
        updateData.isCompleted = this.checkCompletion(updated);
        updateData.completedAt = updateData.isCompleted ? device.completedAt : null;

        await tx.customerDevice.update({
          where: { id: deviceId },
          data: updateData,
        });
        await tx.performanceRecord.delete({ where: { id: recordId } });
      });
    }

    return this.prisma.performanceRecord.delete({
      where: { id: recordId },
    });
  }

  async getDevices(projectId: string) {
    return this.prisma.customerDevice.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
        project: { select: { id: true, projectName: true } },
      },
    });
  }

  async createDevice(projectId: string, data: {
    customerId: string;
    deviceName: string;
    expectedQuantity: number;
    remark?: string;
  }, creatorId: string, roleCode?: string) {
    // 校验：管理员或项目创建人可管理设备清单
    await this.assertProjectManager(projectId, creatorId, roleCode);
    return this.prisma.customerDevice.create({
      data: {
        ...data,
        projectId,
        creatorId,
      },
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });
  }

  async updateDevice(deviceId: string, data: {
    customerId?: string;
    deviceName?: string;
    expectedQuantity?: number;
    remark?: string;
  }, userId?: string, roleCode?: string) {
    // 校验：管理员或项目创建人可编辑设备
    if (userId) {
      const device = await this.prisma.customerDevice.findUnique({
        where: { id: deviceId },
        select: { projectId: true },
      });
      if (device) {
        await this.assertProjectManager(device.projectId, userId, roleCode);
      }
    }
    return this.prisma.customerDevice.update({
      where: { id: deviceId },
      data,
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });
  }

  async deleteDevice(deviceId: string, userId?: string, roleCode?: string) {
    // 校验：管理员或项目创建人可删除设备
    if (userId) {
      const device = await this.prisma.customerDevice.findUnique({
        where: { id: deviceId },
        select: { projectId: true },
      });
      if (device) {
        await this.assertProjectManager(device.projectId, userId, roleCode);
      }
    }
    return this.prisma.customerDevice.delete({
      where: { id: deviceId },
    });
  }

  async recordDelivery(deviceId: string, data: {
    quantity: number;
    collaboratorIds: string[];
    date: string;
    includeRecorder?: boolean;
    remark?: string;
  }, userId: string, roleCode?: string) {
    return this.prisma.$transaction(async (tx) => {
      // 事务内重新读取设备，确保并发安全
      const device = await tx.customerDevice.findUnique({
        where: { id: deviceId },
        include: { project: true, customer: true },
      });
      if (!device) throw new NotFoundException('设备不存在');

      // 校验：管理员或项目成员可记录
      await this.assertProjectMember(device.projectId, userId, roleCode);

      const newQuantity = device.deliveryQuantity + data.quantity;
      if (newQuantity > device.expectedQuantity) {
        throw new BadRequestException(
          `送货数量超出限制：${device.customer?.name || '该客户'}的${device.deviceName}应送${device.expectedQuantity}台，已记录送货${device.deliveryQuantity}台，本次提交${data.quantity}台将超出总量`
        );
      }
      const isCompleted = this.checkCompletion({
        ...device,
        deliveryQuantity: newQuantity,
      });

      const updatedDevice = await tx.customerDevice.update({
        where: { id: deviceId },
        data: {
          deliveryQuantity: newQuantity,
          deliveryBy: userId,
          deliveryAt: new Date(),
          deliveryCollaborators: data.collaboratorIds,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
        include: {
          creator: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
        },
      });
      await tx.performanceRecord.create({
        data: {
          projectId: device.projectId,
          recordType: RecordType.DELIVERY,
          quantity: data.quantity,
          customerId: device.customerId,
          deviceId,
          date: data.date,
          collaboratorIds: data.collaboratorIds,
          includeRecorder: data.includeRecorder ?? true,
          remark: data.remark,
          creatorId: userId,
        },
      });
      return updatedDevice;
    });
  }

  async recordInstall(deviceId: string, data: {
    quantity: number;
    collaboratorIds: string[];
    date: string;
    includeRecorder?: boolean;
    remark?: string;
  }, userId: string, roleCode?: string) {
    return this.prisma.$transaction(async (tx) => {
      const device = await tx.customerDevice.findUnique({
        where: { id: deviceId },
        include: { project: true, customer: true },
      });
      if (!device) throw new NotFoundException('设备不存在');

      // 校验：管理员或项目成员可记录
      await this.assertProjectMember(device.projectId, userId, roleCode);

      const newQuantity = device.installQuantity + data.quantity;
      if (newQuantity > device.deliveryQuantity) {
        throw new BadRequestException(
          `安装数量超出限制：${device.customer?.name || '该客户'}的${device.deviceName}已送货${device.deliveryQuantity}台，已记录安装${device.installQuantity}台，本次提交${data.quantity}台将超出送货数量`
        );
      }
      const isCompleted = this.checkCompletion({
        ...device,
        installQuantity: newQuantity,
      });

      const updatedDevice = await tx.customerDevice.update({
        where: { id: deviceId },
        data: {
          installQuantity: newQuantity,
          installBy: userId,
          installAt: new Date(),
          installCollaborators: data.collaboratorIds,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
        include: {
          creator: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
        },
      });
      await tx.performanceRecord.create({
        data: {
          projectId: device.projectId,
          recordType: RecordType.INSTALL,
          quantity: data.quantity,
          customerId: device.customerId,
          deviceId,
          date: data.date,
          collaboratorIds: data.collaboratorIds,
          includeRecorder: data.includeRecorder ?? true,
          remark: data.remark,
          creatorId: userId,
        },
      });
      return updatedDevice;
    });
  }

  async recordDebug(deviceId: string, data: {
    quantity: number;
    collaboratorIds: string[];
    date: string;
    includeRecorder?: boolean;
    remark?: string;
  }, userId: string, roleCode?: string) {
    return this.prisma.$transaction(async (tx) => {
      const device = await tx.customerDevice.findUnique({
        where: { id: deviceId },
        include: { project: true, customer: true },
      });
      if (!device) throw new NotFoundException('设备不存在');

      // 校验：管理员或项目成员可记录
      await this.assertProjectMember(device.projectId, userId, roleCode);

      const newQuantity = device.debugQuantity + data.quantity;
      if (newQuantity > device.installQuantity) {
        throw new BadRequestException(
          `调试数量超出限制：${device.customer?.name || '该客户'}的${device.deviceName}已安装${device.installQuantity}台，已记录调试${device.debugQuantity}台，本次提交${data.quantity}台将超出安装数量`
        );
      }
      const isCompleted = this.checkCompletion({
        ...device,
        debugQuantity: newQuantity,
      });

      const updatedDevice = await tx.customerDevice.update({
        where: { id: deviceId },
        data: {
          debugQuantity: newQuantity,
          debugBy: userId,
          debugAt: new Date(),
          debugCollaborators: data.collaboratorIds,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
        include: {
          creator: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
        },
      });
      await tx.performanceRecord.create({
        data: {
          projectId: device.projectId,
          recordType: RecordType.DEBUG,
          quantity: data.quantity,
          customerId: device.customerId,
          deviceId,
          date: data.date,
          collaboratorIds: data.collaboratorIds,
          includeRecorder: data.includeRecorder ?? true,
          remark: data.remark,
          creatorId: userId,
        },
      });
      return updatedDevice;
    });
  }

  private checkCompletion(device: any): boolean {
    return (
      device.deliveryQuantity >= device.expectedQuantity &&
      device.installQuantity >= device.deliveryQuantity &&
      device.debugQuantity >= device.installQuantity
    );
  }

  async getStats(projectId: string): Promise<PerformanceResult[]> {
    const project = await this.prisma.performanceProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return [];
    }

    const records = await this.prisma.performanceRecord.findMany({
      where: { projectId },
      include: { creator: { select: { id: true, name: true } } },
    });

    const userStats = new Map<string, PerformanceResult>();

    records.forEach((record) => {
      const allUserIds: string[] = [...record.collaboratorIds];
      if (record.includeRecorder) {
        allUserIds.push(record.creatorId);
      }

      const userCount = allUserIds.length || 1;

      allUserIds.forEach((userId) => {
        if (!userStats.has(userId)) {
          userStats.set(userId, {
            userId,
            userName: userId === record.creatorId ? record.creator.name : '',
            deliveryCount: 0,
            deliveryAmount: 0,
            installCount: 0,
            installAmount: 0,
            debugCount: 0,
            debugAmount: 0,
            totalWorkDays: 0,
            workDaysAmount: 0,
            totalAmount: 0,
          });
        }

        const stats = userStats.get(userId)!;

        if (project.calculationType === CalculationType.QUANTITY && record.quantity) {
          const quantityPerUser = record.quantity / userCount;

          switch (record.recordType) {
            case RecordType.DELIVERY:
              stats.deliveryCount += quantityPerUser;
              stats.deliveryAmount += (quantityPerUser * project.deliveryUnitPrice) || 0;
              break;
            case RecordType.INSTALL:
              stats.installCount += quantityPerUser;
              stats.installAmount += (quantityPerUser * project.installUnitPrice) || 0;
              break;
            case RecordType.DEBUG:
              stats.debugCount += quantityPerUser;
              stats.debugAmount += (quantityPerUser * project.debugUnitPrice) || 0;
              break;
          }
        } else if (project.calculationType === CalculationType.DAILY && record.workHours) {
          const totalWorkDays = record.workHours / 8;
          stats.totalWorkDays += totalWorkDays;
          stats.workDaysAmount += totalWorkDays * project.dailyPrice;
        }
      });
    });

    const users = await this.prisma.user.findMany({
      where: { id: { in: Array.from(userStats.keys()) } },
      select: { id: true, name: true },
    });

    users.forEach((user) => {
      const stats = userStats.get(user.id);
      if (stats) {
        stats.userName = user.name;
      }
    });

    return Array.from(userStats.values()).map((stat) => ({
      ...stat,
      deliveryCount: Math.round(stat.deliveryCount * 100) / 100,
      installCount: Math.round(stat.installCount * 100) / 100,
      debugCount: Math.round(stat.debugCount * 100) / 100,
      totalWorkDays: Math.round(stat.totalWorkDays * 100) / 100,
      totalAmount: stat.deliveryAmount + stat.installAmount + stat.debugAmount + stat.workDaysAmount,
    }));
  }

  async getMyStats(projectId: string, userId: string): Promise<MyPerformanceStats> {
    const project = await this.prisma.performanceProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return {
        deliveryCount: 0,
        installCount: 0,
        debugCount: 0,
        totalWorkDays: 0,
        totalAmount: 0,
      };
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
      deliveryCount: 0,
      installCount: 0,
      debugCount: 0,
      totalWorkDays: 0,
      totalAmount: 0,
    };

    records.forEach((record) => {
      const allUserIds: string[] = [...record.collaboratorIds];
      if (record.includeRecorder) {
        allUserIds.push(record.creatorId);
      }

      const userCount = allUserIds.length || 1;

      if (project.calculationType === CalculationType.QUANTITY && record.quantity) {
        const quantityPerUser = record.quantity / userCount;

        switch (record.recordType) {
          case RecordType.DELIVERY:
            result.deliveryCount += quantityPerUser;
            result.totalAmount += (quantityPerUser * project.deliveryUnitPrice) || 0;
            break;
          case RecordType.INSTALL:
            result.installCount += quantityPerUser;
            result.totalAmount += (quantityPerUser * project.installUnitPrice) || 0;
            break;
          case RecordType.DEBUG:
            result.debugCount += quantityPerUser;
            result.totalAmount += (quantityPerUser * project.debugUnitPrice) || 0;
            break;
        }
      } else if (project.calculationType === CalculationType.DAILY && record.workHours) {
        result.totalWorkDays += record.workHours / 8;
        result.totalAmount += (record.workHours / 8) * project.dailyPrice;
      }
    });

    return {
      deliveryCount: Math.round(result.deliveryCount * 100) / 100,
      installCount: Math.round(result.installCount * 100) / 100,
      debugCount: Math.round(result.debugCount * 100) / 100,
      totalWorkDays: Math.round(result.totalWorkDays * 100) / 100,
      totalAmount: Math.round(result.totalAmount * 100) / 100,
    };
  }

  async exportProject(projectId: string): Promise<Buffer> {
    const project = await this.prisma.performanceProject.findUnique({
      where: { id: projectId },
      include: {
        records: {
          include: {
            customer: true,
            creator: true,
          },
          orderBy: { date: 'desc' },
        },
        creator: true,
      },
    });

    if (!project) {
      throw new Error('项目不存在');
    }

    const workbook = new ExcelJS.Workbook();
    
    // 创建项目信息工作表
    const infoSheet = workbook.addWorksheet('项目信息');
    infoSheet.columns = [
      { header: '项目信息', key: 'label', width: 20 },
      { header: '内容', key: 'value', width: 40 },
    ];
    infoSheet.getRow(1).font = { bold: true };
    
    infoSheet.addRow({ label: '项目名称', value: project.projectName });
    infoSheet.addRow({ label: '计算方式', value: project.calculationType === 'QUANTITY' ? '按量计算' : '按天计算' });
    infoSheet.addRow({ label: '设备总量', value: project.totalQuantity || '-' });
    infoSheet.addRow({ label: '送货单价', value: `${project.deliveryUnitPrice}元/台` });
    infoSheet.addRow({ label: '安装单价', value: `${project.installUnitPrice}元/台` });
    infoSheet.addRow({ label: '调试单价', value: `${project.debugUnitPrice}元/台` });
    infoSheet.addRow({ label: '日结单价', value: `${project.dailyPrice}元/人/天` });
    infoSheet.addRow({ label: '备注', value: project.remark || '-' });
    infoSheet.addRow({ label: '创建人', value: project.creator?.name || '-' });
    infoSheet.addRow({ label: '创建时间', value: new Date(project.createdAt).toLocaleString('zh-CN') });

    // 创建工作记录工作表
    const recordSheet = workbook.addWorksheet('工作记录');
    recordSheet.columns = [
      { header: '日期', key: 'date', width: 12 },
      { header: '记录类型', key: 'recordType', width: 10 },
      { header: '数量/工时', key: 'quantity', width: 12 },
      { header: '客户', key: 'customer', width: 20 },
      { header: '协作人员', key: 'collaborators', width: 25 },
      { header: '包含记录人', key: 'includeRecorder', width: 10 },
      { header: '描述/备注', key: 'description', width: 30 },
      { header: '记录人', key: 'creator', width: 12 },
    ];
    
    const headerRow = recordSheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    const recordTypeLabels: Record<RecordType, string> = {
      DELIVERY: '送货',
      INSTALL: '安装',
      DEBUG: '调试',
      CONSTRUCTION: '施工',
    };

    const collaborators = await this.prisma.user.findMany({
      where: { id: { in: [...new Set(project.records.flatMap(r => r.collaboratorIds))] } },
    });
    const collaboratorMap = new Map(collaborators.map(c => [c.id, c.name]));

    project.records.forEach(record => {
      const recordTypeName = record.recordType ? recordTypeLabels[record.recordType] : '-';
      const quantityOrHours = record.quantity 
        ? `${record.quantity}台` 
        : record.workHours 
          ? `${record.workHours}小时 (${(record.workHours / 8).toFixed(1)}天)` 
          : '-';
      const collaboratorNames = record.collaboratorIds.map(id => collaboratorMap.get(id) || id).join(', ');
      
      recordSheet.addRow({
        date: new Date(record.date).toLocaleDateString('zh-CN'),
        recordType: recordTypeName,
        quantity: quantityOrHours,
        customer: record.customer?.name || '-',
        collaborators: collaboratorNames,
        includeRecorder: record.includeRecorder ? '是' : '否',
        description: record.description || record.remark || '-',
        creator: record.creator?.name || '-',
      });
    });

    // 创建工作量统计工作表
    const stats = await this.getStats(projectId);
    const statsSheet = workbook.addWorksheet('工作量统计');
    statsSheet.columns = [
      { header: '参与人员', key: 'userName', width: 15 },
      { header: '送货数量', key: 'deliveryCount', width: 12 },
      { header: '送货金额', key: 'deliveryAmount', width: 12 },
      { header: '安装数量', key: 'installCount', width: 12 },
      { header: '安装金额', key: 'installAmount', width: 12 },
      { header: '调试数量', key: 'debugCount', width: 12 },
      { header: '调试金额', key: 'debugAmount', width: 12 },
      { header: '工作天数', key: 'totalWorkDays', width: 12 },
      { header: '日结金额', key: 'workDaysAmount', width: 12 },
      { header: '合计金额', key: 'totalAmount', width: 12 },
    ];
    
    const statsHeaderRow = statsSheet.getRow(1);
    statsHeaderRow.font = { bold: true };
    statsHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };

    stats.forEach(stat => {
      statsSheet.addRow({
        userName: stat.userName,
        deliveryCount: stat.deliveryCount.toFixed(2),
        deliveryAmount: `${stat.deliveryAmount.toFixed(2)}元`,
        installCount: stat.installCount.toFixed(2),
        installAmount: `${stat.installAmount.toFixed(2)}元`,
        debugCount: stat.debugCount.toFixed(2),
        debugAmount: `${stat.debugAmount.toFixed(2)}元`,
        totalWorkDays: stat.totalWorkDays.toFixed(2),
        workDaysAmount: `${stat.workDaysAmount.toFixed(2)}元`,
        totalAmount: `${stat.totalAmount.toFixed(2)}元`,
      });
    });

    // 添加合计行
    const totalRow = statsSheet.addRow({
      userName: '合计',
      deliveryCount: stats.reduce((sum, s) => sum + s.deliveryCount, 0).toFixed(2),
      deliveryAmount: `${stats.reduce((sum, s) => sum + s.deliveryAmount, 0).toFixed(2)}元`,
      installCount: stats.reduce((sum, s) => sum + s.installCount, 0).toFixed(2),
      installAmount: `${stats.reduce((sum, s) => sum + s.installAmount, 0).toFixed(2)}元`,
      debugCount: stats.reduce((sum, s) => sum + s.debugCount, 0).toFixed(2),
      debugAmount: `${stats.reduce((sum, s) => sum + s.debugAmount, 0).toFixed(2)}元`,
      totalWorkDays: stats.reduce((sum, s) => sum + s.totalWorkDays, 0).toFixed(2),
      workDaysAmount: `${stats.reduce((sum, s) => sum + s.workDaysAmount, 0).toFixed(2)}元`,
      totalAmount: `${stats.reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}元`,
    });
    totalRow.font = { bold: true };

    return workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  async exportProjects(projectIds?: string[]): Promise<Buffer> {
    const where = projectIds && projectIds.length > 0
      ? { id: { in: projectIds } }
      : {};

    const projects = await this.prisma.performanceProject.findMany({
      where,
      include: {
        records: {
          include: { customer: true },
        },
        creator: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();

    // 创建项目汇总表
    const summarySheet = workbook.addWorksheet('项目汇总');
    summarySheet.columns = [
      { header: '项目名称', key: 'projectName', width: 25 },
      { header: '计算方式', key: 'calculationType', width: 12 },
      { header: '设备总量', key: 'totalQuantity', width: 12 },
      { header: '记录数', key: 'recordCount', width: 10 },
      { header: '创建人', key: 'creator', width: 12 },
      { header: '创建时间', key: 'createdAt', width: 18 },
    ];
    
    const summaryHeader = summarySheet.getRow(1);
    summaryHeader.font = { bold: true };
    summaryHeader.alignment = { vertical: 'middle', horizontal: 'center' };

    // 获取所有用户信息
    const allUserIds = [...new Set(projects.flatMap(p => [p.creatorId, ...p.records.flatMap(r => r.collaboratorIds)]))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: allUserIds } },
    });
    const userMap = new Map(users.map(u => [u.id, u.name]));

    // 添加各项目工作表并汇总
    projects.forEach(project => {
      // 添加到汇总表
      summarySheet.addRow({
        projectName: project.projectName,
        calculationType: project.calculationType === 'QUANTITY' ? '按量计算' : '按天计算',
        totalQuantity: project.totalQuantity || '-',
        recordCount: project.records.length,
        creator: userMap.get(project.creatorId) || '-',
        createdAt: new Date(project.createdAt).toLocaleString('zh-CN'),
      });

      // 创建每个项目的详情工作表
      const detailSheet = workbook.addWorksheet(project.projectName.length > 30 ? project.projectName.substring(0, 30) : project.projectName);
      detailSheet.columns = [
        { header: '日期', key: 'date', width: 12 },
        { header: '类型', key: 'recordType', width: 10 },
        { header: '数量/工时', key: 'quantity', width: 12 },
        { header: '客户', key: 'customer', width: 20 },
        { header: '协作人员', key: 'collaborators', width: 25 },
        { header: '金额', key: 'amount', width: 12 },
      ];
      
      const detailHeader = detailSheet.getRow(1);
      detailHeader.font = { bold: true };

      const recordTypeLabels: Record<RecordType, string> = {
        DELIVERY: '送货',
        INSTALL: '安装',
        DEBUG: '调试',
        CONSTRUCTION: '施工',
      };

      project.records.forEach(record => {
        let amount = 0;
        if (project.calculationType === 'QUANTITY' && record.quantity) {
          const userCount = [...record.collaboratorIds, ...(record.includeRecorder ? [record.creatorId] : [])].length || 1;
          const quantityPerUser = record.quantity / userCount;
          switch (record.recordType) {
            case RecordType.DELIVERY:
              amount = quantityPerUser * project.deliveryUnitPrice;
              break;
            case RecordType.INSTALL:
              amount = quantityPerUser * project.installUnitPrice;
              break;
            case RecordType.DEBUG:
              amount = quantityPerUser * project.debugUnitPrice;
              break;
          }
        } else if (project.calculationType === CalculationType.DAILY && record.workHours) {
          amount = (record.workHours / 8) * project.dailyPrice;
        }

        detailSheet.addRow({
          date: new Date(record.date).toLocaleDateString('zh-CN'),
          recordType: record.recordType ? recordTypeLabels[record.recordType] : '-',
          quantity: record.quantity ? `${record.quantity}台` : record.workHours ? `${record.workHours}小时` : '-',
          customer: record.customer?.name || '-',
          collaborators: record.collaboratorIds.map(id => userMap.get(id) || id).join(', '),
          amount: `${amount.toFixed(2)}元`,
        });
      });
    });

    return workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  async getFeeRecords(projectId?: string) {
    return this.prisma.feeRecord.findMany({
      where: projectId ? { projectId } : { projectId: null },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });
  }

  async saveFeeRecord(projectId: string | null, data: {
    items: any[];
    subtotal: number;
    discount: number;
    actualAmount: number;
    remark?: string;
    customerId?: string;
    collaboratorIds?: string[];
  }, creatorId: string) {
    return this.prisma.feeRecord.create({
      data: {
        projectId: projectId || null,
        customerId: data.customerId,
        items: data.items as unknown as Prisma.InputJsonValue,
        subtotal: data.subtotal,
        discount: data.discount,
        actualAmount: data.actualAmount,
        remark: data.remark,
        creatorId,
        collaboratorIds: data.collaboratorIds || [],
      },
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    });
  }

  async deleteFeeRecord(projectId: string | null, recordId: string) {
    const record = await this.prisma.feeRecord.findFirst({
      where: projectId ? { id: recordId, projectId } : { id: recordId, projectId: null },
    });
    if (!record) throw new NotFoundException('费用记录不存在');
    return this.prisma.feeRecord.delete({ where: { id: recordId } });
  }

  async getGlobalStats(startDate?: string, endDate?: string, userId?: string) {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;

    const recordWhere: any = {};
    if (startDate || endDate) recordWhere.date = dateFilter;

    const projects = await this.prisma.performanceProject.findMany({
      include: {
        records: {
          where: Object.keys(recordWhere).length > 0 ? recordWhere : undefined,
          include: { creator: { select: { id: true, name: true } } },
        },
      },
    });

    const userStats = new Map();

    for (const project of projects) {
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
              deliveryCount: 0,
              deliveryAmount: 0,
              installCount: 0,
              installAmount: 0,
              debugCount: 0,
              debugAmount: 0,
              totalWorkDays: 0,
              workDaysAmount: 0,
              totalAmount: 0,
              projectCount: new Set(),
            });
          }

          const stats = userStats.get(uid)!;
          stats.projectCount.add(project.id);

          if (project.calculationType === CalculationType.QUANTITY && record.quantity) {
            const quantityPerUser = record.quantity / userCount;
            switch (record.recordType) {
              case RecordType.DELIVERY:
                stats.deliveryCount += quantityPerUser;
                stats.deliveryAmount += (quantityPerUser * project.deliveryUnitPrice) || 0;
                break;
              case RecordType.INSTALL:
                stats.installCount += quantityPerUser;
                stats.installAmount += (quantityPerUser * project.installUnitPrice) || 0;
                break;
              case RecordType.DEBUG:
                stats.debugCount += quantityPerUser;
                stats.debugAmount += (quantityPerUser * project.debugUnitPrice) || 0;
                break;
            }
          } else if (project.calculationType === CalculationType.DAILY && record.workHours) {
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
      deliveryCount: Math.round(stat.deliveryCount * 100) / 100,
      deliveryAmount: Math.round(stat.deliveryAmount * 100) / 100,
      installCount: Math.round(stat.installCount * 100) / 100,
      installAmount: Math.round(stat.installAmount * 100) / 100,
      debugCount: Math.round(stat.debugCount * 100) / 100,
      debugAmount: Math.round(stat.debugAmount * 100) / 100,
      totalWorkDays: Math.round(stat.totalWorkDays * 100) / 100,
      workDaysAmount: Math.round(stat.workDaysAmount * 100) / 100,
      totalAmount: Math.round(
        (stat.deliveryAmount + stat.installAmount + stat.debugAmount + stat.workDaysAmount) * 100
      ) / 100,
    }));
  }
}
