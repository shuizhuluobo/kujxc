import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { CodeGeneratorService } from './code-generator.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CodeGeneratorService', () => {
  let service: CodeGeneratorService;

  const mockTx = {
    codeSequence: {
      create: jest.fn(),
      update: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  const mockPrisma = {
    codePrefixConfig: { findUnique: jest.fn() },
    codeSequence: {
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((fn: (tx: unknown) => unknown) => fn(mockTx)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrisma.codePrefixConfig.findUnique.mockImplementation(
      (args: { where: { entityType: string } }) => {
        const prefixes: Record<string, string> = {
          product: 'LX',
          quotation: 'BJ',
          customer: 'KH',
        };
        return Promise.resolve({
          entityType: args.where.entityType,
          prefix: prefixes[args.where.entityType] || 'CODE',
          isActive: true,
        });
      },
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodeGeneratorService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CodeGeneratorService>(CodeGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('生成编号格式应为 {前缀}-{YYMM}-{5位序列}', async () => {
    mockTx.$queryRaw.mockResolvedValue([{ id: 1, currentValue: 0 }]);
    mockTx.codeSequence.update.mockResolvedValue({
      currentValue: 42,
    });

    const code = await service.generateCode('product');
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    expect(code).toBe(`LX-${yy}${mm}-00042`);
  });

  it('首次生成该月序列时创建记录并返回 1', async () => {
    mockTx.$queryRaw.mockResolvedValue([]);
    mockTx.codeSequence.create.mockResolvedValue({
      currentValue: 1,
    });

    const code = await service.generateCode('quotation');
    expect(code).toMatch(/^BJ-\d{4}-00001$/);
  });

  it('批量生成编号连续且无重复', async () => {
    mockTx.$queryRaw.mockResolvedValue([{ id: 1, currentValue: 5 }]);
    mockTx.codeSequence.update.mockResolvedValue({
      currentValue: 5 + 3,
    });

    const codes = await service.generateBatchCodes('product', 3);
    expect(codes.length).toBe(3);
    expect(new Set(codes).size).toBe(3);
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    expect(codes[0]).toBe(`LX-${yy}${mm}-00006`);
    expect(codes[2]).toBe(`LX-${yy}${mm}-00008`);
  });

  it('并发创建序列冲突（P2002）时自动重试', async () => {
    mockTx.$queryRaw.mockResolvedValue([]);
    mockTx.codeSequence.create
      .mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: '5.22.0',
        }),
      )
      .mockResolvedValueOnce({ currentValue: 1 });

    const code = await service.generateCode('product');
    expect(code).toMatch(/^LX-\d{4}-00001$/);
    expect(mockTx.codeSequence.create).toHaveBeenCalledTimes(2);
  });

  it('校验编号格式', async () => {
    mockTx.$queryRaw.mockResolvedValue([]);
    await expect(
      service.validateCodeFormat('LX-2608-00001', 'product'),
    ).resolves.toBe(true);
    await expect(
      service.validateCodeFormat('bad-code', 'product'),
    ).resolves.toBe(false);
  });
});
