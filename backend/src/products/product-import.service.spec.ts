import { Test, TestingModule } from '@nestjs/testing';
import { ProductImportService } from './product-import.service';
import { PrismaService } from '../prisma/prisma.service';
import { CodeGeneratorService } from '../common/services/code-generator.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { BrandsService } from './brands.service';
import { CategoriesService } from './categories.service';
import { ProductTagsService } from './product-tags.service';
import { ImportPreviewDto, ImportExecuteDto } from './dto';

type AnyMock = jest.Mock;

type MockPrismaModel = Record<string, jest.Mock>;
type MockPrisma = Record<string, MockPrismaModel>;

function buildMockPrisma(): MockPrisma {
  return {
    brand: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    category: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    productTag: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    productImage: {
      createMany: jest.fn(),
    },
    productImportLog: {
      create: jest.fn(),
    },
  };
}

const MAPPING = {
  name: '品牌型号',
  model: '型号',
  brandName: '品牌',
  categoryPath: '类型',
  marketPrice: '价格',
};

function row(
  name: string,
  model: string,
  brand: string,
  category = '智能门锁',
  price = '100',
) {
  return {
    品牌型号: name,
    型号: model,
    品牌: brand,
    类型: category,
    价格: price,
  };
}

describe('ProductImportService', () => {
  let service: ProductImportService;
  let mockPrisma: ReturnType<typeof buildMockPrisma>;
  let mockBrands: { findOrCreateMany: AnyMock };
  let mockCategories: { findOrCreateByPath: AnyMock };
  let mockTags: { findOrCreateMany: AnyMock };
  let mockCodeGenerator: { generateBatchCodes: AnyMock };
  let mockAuditLog: { log: AnyMock };

  beforeEach(async () => {
    mockPrisma = buildMockPrisma();
    mockBrands = { findOrCreateMany: jest.fn() };
    mockCategories = { findOrCreateByPath: jest.fn() };
    mockTags = { findOrCreateMany: jest.fn() };
    mockCodeGenerator = { generateBatchCodes: jest.fn() };
    mockAuditLog = { log: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductImportService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CodeGeneratorService, useValue: mockCodeGenerator },
        { provide: AuditLogService, useValue: mockAuditLog },
        { provide: BrandsService, useValue: mockBrands },
        { provide: CategoriesService, useValue: mockCategories },
        { provide: ProductTagsService, useValue: mockTags },
      ],
    }).compile();

    service = module.get<ProductImportService>(ProductImportService);
  });

  afterEach(() => jest.clearAllMocks());

  // ==================== preview ====================

  describe('preview', () => {
    it('品牌型号缺失时自动用「品牌 + 型号」拼接', async () => {
      mockPrisma.brand.findMany.mockResolvedValue([
        { id: 'brand-1', name: '小米' },
      ]);
      mockPrisma.product.findMany.mockResolvedValue([]);

      const dto: ImportPreviewDto = {
        mappingConfig: MAPPING,
        rows: [row('', 'X1', '小米')],
      };
      const result = await service.preview(dto);

      expect(result.errorRows).toBe(0);
      expect(result.rows[0].mapped.name).toBe('小米 X1');
    });

    it('识别库内已存在产品（品牌+型号）为重复', async () => {
      mockPrisma.brand.findMany.mockResolvedValue([
        { id: 'brand-1', name: '小米' },
      ]);
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p1', brandId: 'brand-1', name: '小米 X1', model: 'X1' },
      ]);

      const dto: ImportPreviewDto = {
        mappingConfig: MAPPING,
        rows: [row('小米 X1', 'X1', '小米')],
      };
      const result = await service.preview(dto);

      expect(result.rows[0].status).toBe('warning');
      const dup = result.rows[0].issues.find((i) => i.field === 'duplicate');
      expect(dup?.message).toContain('与库中已存在产品重复');
      expect(dup?.message).toContain('将跳过');
    });

    it('型号匹配忽略大小写与多余空格', async () => {
      mockPrisma.brand.findMany.mockResolvedValue([
        { id: 'brand-1', name: '小米' },
      ]);
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p1', brandId: 'brand-1', name: '小米 X1', model: 'X1' },
      ]);

      const dto: ImportPreviewDto = {
        mappingConfig: MAPPING,
        rows: [row('小米 X1', ' x1 ', '小米')],
      };
      const result = await service.preview(dto);
      expect(result.rows[0].issues.some((i) => i.field === 'duplicate')).toBe(
        true,
      );
    });

    it('型号存在但不同名，不按名称回退误判', async () => {
      mockPrisma.brand.findMany.mockResolvedValue([
        { id: 'brand-1', name: '小米' },
      ]);
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p1', brandId: 'brand-1', name: '小米 X1', model: 'X1' },
      ]);

      const dto: ImportPreviewDto = {
        mappingConfig: MAPPING,
        rows: [row('小米 X1', 'X2', '小米')],
      };
      const result = await service.preview(dto);
      expect(result.rows[0].issues.some((i) => i.field === 'duplicate')).toBe(
        false,
      );
    });

    it('识别同一文件内的重复行', async () => {
      mockPrisma.brand.findMany.mockResolvedValue([
        { id: 'brand-1', name: '小米' },
      ]);
      mockPrisma.product.findMany.mockResolvedValue([]);

      const dto: ImportPreviewDto = {
        mappingConfig: MAPPING,
        rows: [row('', 'X1', '小米'), row('', 'X1', '小米')],
      };
      const result = await service.preview(dto);

      expect(result.rows[0].status).toBe('ok');
      expect(result.rows[1].status).toBe('warning');
      const dup = result.rows[1].issues.find((i) => i.field === 'duplicate');
      expect(dup?.message).toContain('与文件内第 2 行重复');
    });

    it('createMissingBrand=false 时提示品牌不存在', async () => {
      mockPrisma.brand.findMany.mockResolvedValue([]);

      const dto: ImportPreviewDto = {
        mappingConfig: MAPPING,
        rows: [row('小米 X1', 'X1', '小米')],
        options: { createMissingBrand: false },
      };
      const result = await service.preview(dto);

      expect(result.rows[0].status).toBe('error');
      expect(result.rows[0].issues[0].message).toContain('「小米」不存在');
    });

    it('createMissingCategory=false 且类型不存在时报错', async () => {
      mockPrisma.brand.findMany.mockResolvedValue([
        { id: 'brand-1', name: '小米' },
      ]);
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.category.findMany.mockResolvedValue([]);

      const dto: ImportPreviewDto = {
        mappingConfig: MAPPING,
        rows: [row('小米 X1', 'X1', '小米')],
        options: { createMissingCategory: false },
      };
      const result = await service.preview(dto);
      expect(result.rows[0].status).toBe('error');
      expect(
        result.rows[0].issues.some((i) => i.field === 'categoryPath'),
      ).toBe(true);
    });
  });

  // ==================== execute ====================

  describe('execute', () => {
    const execDto = (rows: Record<string, unknown>[], strategy = 'skip') => {
      const dto = new ImportExecuteDto();
      dto.mappingConfig = MAPPING;
      dto.rows = rows;
      dto.options = {
        duplicateStrategy: strategy as 'skip' | 'overwrite' | 'create',
      };
      return dto;
    };

    function mockBrand() {
      mockPrisma.brand.findFirst.mockResolvedValue({
        id: 'brand-1',
        name: '小米',
      });
      mockPrisma.brand.findMany.mockResolvedValue([
        { id: 'brand-1', name: '小米' },
      ]);
    }

    function mockCategory() {
      mockCategories.findOrCreateByPath.mockResolvedValue('cat-1');
    }

    beforeEach(() => {
      mockCodeGenerator.generateBatchCodes.mockResolvedValue(['P-001']);
      mockPrisma.productImportLog.create.mockImplementation(
        (args: {
          data: { totalRows: number; successRows: number; skippedRows: number };
        }) =>
          Promise.resolve({
            id: 'log-1',
            ...args.data,
            status: 'completed',
            createdAt: new Date(),
          }),
      );
      mockPrisma.product.create.mockImplementation(
        (args: { data: { name: string; brandId: string } }) =>
          Promise.resolve({ id: 'new-1', ...args.data }),
      );
    });

    it('同一文件内重复行：首行新建，次行按策略跳过', async () => {
      mockBrand();
      mockCategory();
      mockPrisma.product.findMany.mockResolvedValue([]);

      const result = await service.execute(
        'user-1',
        execDto([row('', 'X1', '小米'), row('', 'X1', '小米')]),
      );

      expect(mockPrisma.product.create).toHaveBeenCalledTimes(1);
      expect(result.successRows).toBe(1);
      expect(result.skippedRows).toBe(1);
      expect(mockPrisma.productImportLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ skippedRows: 1 }),
        }),
      );
    });

    it('库内已存在（品牌+型号）时按 skip 策略跳过', async () => {
      mockBrand();
      mockCategory();
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p1', brandId: 'brand-1', name: '小米 X1', model: 'X1' },
      ]);

      const result = await service.execute(
        'user-1',
        execDto([row('', 'X1', '小米')]),
      );

      expect(mockPrisma.product.create).not.toHaveBeenCalled();
      expect(result.successRows).toBe(0);
      expect(result.skippedRows).toBe(1);
    });

    it('库内已存在时按 overwrite 策略更新目标产品', async () => {
      mockBrand();
      mockCategory();
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p1', brandId: 'brand-1', name: '小米 X1', model: 'X1' },
      ]);
      mockPrisma.product.findFirst.mockResolvedValue({
        id: 'p1',
        deletedAt: null,
      });
      mockPrisma.product.update.mockResolvedValue({
        id: 'p1',
        name: '小米 X1',
      });

      const result = await service.execute(
        'user-1',
        execDto([row('', 'X1', '小米')], 'overwrite'),
      );

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: expect.objectContaining({ model: 'X1', updatedBy: 'user-1' }),
      });
      expect(result.overwrittenRows).toBe(1);
      expect(result.successRows).toBe(1);
      expect(result.skippedRows).toBe(0);
    });

    it('create 策略允许重复，全部新建', async () => {
      mockBrand();
      mockCategory();
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p1', brandId: 'brand-1', name: '小米 X1', model: 'X1' },
      ]);

      const result = await service.execute(
        'user-1',
        execDto([row('', 'X1', '小米')], 'create'),
      );

      expect(mockPrisma.product.create).toHaveBeenCalledTimes(1);
      expect(result.successRows).toBe(1);
      expect(result.skippedRows).toBe(0);
    });

    it('品牌大小写变体复用已有品牌，不重复创建', async () => {
      // 库中已有「小米」，本次导入写「mi」大小写变体 → 复用 brand-1
      mockPrisma.brand.findFirst.mockResolvedValue({
        id: 'brand-1',
        name: '小米',
      });
      mockPrisma.brand.findUnique.mockResolvedValue(null);
      mockCategory();
      mockPrisma.product.findMany.mockResolvedValue([]);

      const dto = execDto([{ ...row('', 'X1', 'MI'), 品牌: 'MI' }]);
      const result = await service.execute('user-1', dto);

      expect(mockBrands.findOrCreateMany).not.toHaveBeenCalled();
      expect(result.createdBrands).toHaveLength(0);
      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ brandId: 'brand-1' }),
        }),
      );
    });

    it('品牌型号缺失且无法拼接时记为错误', async () => {
      const dto = execDto([{ 型号: '', 品牌: '', 价格: '100' }]);
      const result = await service.execute('user-1', dto);

      expect(result.failedRows).toBe(1);
      expect(result.errors[0].message).toContain('品牌/型号为空');
      expect(mockPrisma.product.create).not.toHaveBeenCalled();
    });
  });
});
