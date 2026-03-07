import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkOrdersService } from './work-orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WorkOrderStatus, ScoreLevel } from '@prisma/client';

describe('WorkOrdersService', () => {
  let service: WorkOrdersService;
  let prismaService: jest.Mocked<PrismaService>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockWorkOrder = {
    id: 'wo-id-1',
    customerId: 'customer-id-1',
    regionId: 'region-id-1',
    serviceTypeId: 'service-type-id-1',
    creatorId: 'user-id-1',
    receiverId: null,
    completerId: null,
    detail: 'Test work order',
    status: WorkOrderStatus.PENDING,
    scoreLevel: ScoreLevel.NORMAL,
    createdAt: new Date(),
    updatedAt: new Date(),
    receivedAt: null,
    completedAt: null,
    customer: { id: 'customer-id-1', name: 'Test Customer' },
    region: { id: 'region-id-1', name: 'Test Region' },
    serviceType: { id: 'service-type-id-1', name: 'Test Service' },
    creator: { id: 'user-id-1', name: 'Creator' },
    receiver: null,
    completer: null,
    collaborators: [],
  };

  beforeEach(async () => {
    const mockPrisma = {
      workOrder: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      workOrderCollaborator: {
        createMany: jest.fn(),
      },
      $transaction: jest.fn((fn) =>
        fn({
          workOrder: {
            update: jest.fn(),
            findUnique: jest.fn(),
          },
          workOrderCollaborator: {
            createMany: jest.fn(),
          },
        }),
      ),
    };

    const mockNotifications = {
      notifyRegionEngineers: jest.fn(),
      create: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrdersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<WorkOrdersService>(WorkOrdersService);
    prismaService = module.get(PrismaService);
    notificationsService = module.get(NotificationsService);
    eventEmitter = module.get(EventEmitter2);
  });

  describe('create', () => {
    it('should create a work order and notify engineers', async () => {
      const createDto = {
        customerId: 'customer-id-1',
        regionId: 'region-id-1',
        serviceTypeId: 'service-type-id-1',
        detail: 'Test work order',
      };

      prismaService.workOrder.create.mockResolvedValue(mockWorkOrder as any);
      notificationsService.notifyRegionEngineers.mockResolvedValue(undefined);

      const result = await service.create(createDto, 'user-id-1');

      expect(result).toEqual(mockWorkOrder);
      expect(notificationsService.notifyRegionEngineers).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('app.event', {
        type: 'work-order.created',
        payload: mockWorkOrder,
      });
    });
  });

  describe('findOne', () => {
    it('should return a work order when found', async () => {
      prismaService.workOrder.findUnique.mockResolvedValue(
        mockWorkOrder as any,
      );

      const result = await service.findOne('wo-id-1');

      expect(result).toEqual(mockWorkOrder);
    });

    it('should throw NotFoundException when work order not found', async () => {
      prismaService.workOrder.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a work order when user is creator', async () => {
      const updateDto = { detail: 'Updated detail' };
      const updatedOrder = { ...mockWorkOrder, detail: 'Updated detail' };

      prismaService.workOrder.findUnique.mockResolvedValue(
        mockWorkOrder as any,
      );
      prismaService.workOrder.update.mockResolvedValue(updatedOrder as any);

      const result = await service.update('wo-id-1', updateDto, 'user-id-1');

      expect(result).toEqual(updatedOrder);
    });

    it('should throw ForbiddenException when user is not creator', async () => {
      prismaService.workOrder.findUnique.mockResolvedValue(
        mockWorkOrder as any,
      );

      await expect(
        service.update('wo-id-1', { detail: 'Updated' }, 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete a work order when user is creator', async () => {
      prismaService.workOrder.findUnique.mockResolvedValue(
        mockWorkOrder as any,
      );
      prismaService.workOrder.delete.mockResolvedValue(mockWorkOrder as any);

      const result = await service.remove('wo-id-1', 'user-id-1');

      expect(result).toEqual({ message: '删除成功' });
      expect(eventEmitter.emit).toHaveBeenCalledWith('app.event', {
        type: 'work-order.deleted',
        payload: { id: 'wo-id-1' },
      });
    });

    it('should throw ForbiddenException when user is not creator', async () => {
      prismaService.workOrder.findUnique.mockResolvedValue(
        mockWorkOrder as any,
      );

      await expect(service.remove('wo-id-1', 'other-user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('receive', () => {
    it('should receive a pending work order', async () => {
      const receivedOrder = {
        ...mockWorkOrder,
        status: WorkOrderStatus.RECEIVED,
        receiverId: 'user-id-2',
        receivedAt: new Date(),
        receiver: { id: 'user-id-2', name: 'Receiver' },
      };

      prismaService.workOrder.findUnique.mockResolvedValue(
        mockWorkOrder as any,
      );
      prismaService.workOrder.update.mockResolvedValue(receivedOrder as any);

      const result = await service.receive('wo-id-1', 'user-id-2');

      expect(result.status).toBe(WorkOrderStatus.RECEIVED);
      expect(result.receiverId).toBe('user-id-2');
    });

    it('should throw BadRequestException when work order is completed', async () => {
      const completedOrder = {
        ...mockWorkOrder,
        status: WorkOrderStatus.COMPLETED,
      };

      prismaService.workOrder.findUnique.mockResolvedValue(
        completedOrder as any,
      );

      await expect(service.receive('wo-id-1', 'user-id-2')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cancelReceive', () => {
    it('should cancel receive when user is receiver', async () => {
      const receivedOrder = {
        ...mockWorkOrder,
        status: WorkOrderStatus.RECEIVED,
        receiverId: 'user-id-2',
        receivedAt: new Date(),
        receiver: { id: 'user-id-2', name: 'Receiver' },
      };

      prismaService.workOrder.findUnique.mockResolvedValue(
        receivedOrder as any,
      );
      prismaService.workOrder.update.mockResolvedValue(mockWorkOrder as any);

      const result = await service.cancelReceive('wo-id-1', 'user-id-2');

      expect(result.status).toBe(WorkOrderStatus.PENDING);
    });

    it('should throw ForbiddenException when user is not receiver', async () => {
      const receivedOrder = {
        ...mockWorkOrder,
        status: WorkOrderStatus.RECEIVED,
        receiverId: 'user-id-2',
      };

      prismaService.workOrder.findUnique.mockResolvedValue(
        receivedOrder as any,
      );

      await expect(
        service.cancelReceive('wo-id-1', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when work order is not received', async () => {
      const pendingOrderWithReceiver = {
        ...mockWorkOrder,
        status: WorkOrderStatus.PENDING,
        receiverId: 'user-id-1',
      };

      prismaService.workOrder.findUnique.mockResolvedValue(
        pendingOrderWithReceiver as any,
      );

      await expect(
        service.cancelReceive('wo-id-1', 'user-id-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('complete', () => {
    it('should complete a received work order', async () => {
      const receivedOrder = {
        ...mockWorkOrder,
        status: WorkOrderStatus.RECEIVED,
        receiverId: 'user-id-2',
        receivedAt: new Date(),
        receiver: { id: 'user-id-2', name: 'Receiver' },
      };

      const completedOrder = {
        ...receivedOrder,
        status: WorkOrderStatus.COMPLETED,
        completerId: 'user-id-2',
        completedAt: new Date(),
        completer: { id: 'user-id-2', name: 'Completer' },
      };

      prismaService.workOrder.findUnique.mockResolvedValue(
        receivedOrder as any,
      );
      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (fn) => {
          const tx = {
            workOrder: {
              update: jest.fn().mockResolvedValue(undefined),
              findUnique: jest.fn().mockResolvedValue(completedOrder as any),
            },
            workOrderCollaborator: {
              createMany: jest.fn().mockResolvedValue({ count: 0 }),
            },
          };
          return fn(tx);
        },
      );

      const result = await service.complete('wo-id-1', 'user-id-2', {});

      expect(result.status).toBe(WorkOrderStatus.COMPLETED);
    });

    it('should throw ForbiddenException when user is not receiver', async () => {
      const receivedOrder = {
        ...mockWorkOrder,
        status: WorkOrderStatus.RECEIVED,
        receiverId: 'user-id-2',
      };

      prismaService.workOrder.findUnique.mockResolvedValue(
        receivedOrder as any,
      );

      await expect(
        service.complete('wo-id-1', 'other-user', {}),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when work order is not received', async () => {
      prismaService.workOrder.findUnique.mockResolvedValue(
        mockWorkOrder as any,
      );

      await expect(
        service.complete('wo-id-1', 'user-id-1', {}),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getStats', () => {
    it('should return work order statistics', async () => {
      prismaService.workOrder.count
        .mockResolvedValueOnce(5) // pending
        .mockResolvedValueOnce(3); // received

      const result = await service.getStats('region-id-1');

      expect(result).toEqual({
        pending: 5,
        received: 3,
        total: 8,
      });
    });
  });
});
