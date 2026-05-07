import { Test, TestingModule } from '@nestjs/testing';
import { WikiService } from './wiki.service';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../common/services/files.service';

/* eslint-disable @typescript-eslint/no-unsafe-call */

describe('WikiService', () => {
  let service: WikiService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
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

    const mockFilesService = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WikiService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: FilesService, useValue: mockFilesService },
      ],
    }).compile();

    service = module.get<WikiService>(WikiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const dto = { name: 'Test Category' };
      const expected = { id: '1', ...dto, sortOrder: 0 };

      mockPrisma.wikiCategory.create.mockResolvedValue(expected);

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

      mockPrisma.wikiCategory.findMany.mockResolvedValue(expected);

      const result = await service.findAllCategories();

      expect(result).toEqual(expected);
    });
  });
});
