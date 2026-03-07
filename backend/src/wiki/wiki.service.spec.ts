import { Test, TestingModule } from '@nestjs/testing';
import { WikiService } from './wiki.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WikiService', () => {
  let service: WikiService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrisma = {
      wikiCategory: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      wikiTag: {
        findMany: jest.fn(),
      },
      wikiArticle: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WikiService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WikiService>(WikiService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const dto = { name: 'Test Category' };
      const expected = { id: '1', ...dto, sortOrder: 0 };

      prismaService.wikiCategory.create.mockResolvedValue(expected as any);

      const result = await service.createCategory(dto);

      expect(result).toEqual(expected);
    });
  });

  describe('findAllCategories', () => {
    it('should return all categories with article count', async () => {
      const expected = [
        { id: '1', name: 'Category 1', _count: { articles: 5 } },
        { id: '2', name: 'Category 2', _count: { articles: 3 } },
      ];

      prismaService.wikiCategory.findMany.mockResolvedValue(expected as any);

      const result = await service.findAllCategories();

      expect(result).toEqual(expected);
    });
  });
});
