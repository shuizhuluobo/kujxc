import { Test, TestingModule } from '@nestjs/testing';
import { WikiController } from './wiki.controller';
import { WikiService } from './wiki.service';

describe('WikiController', () => {
  let controller: WikiController;
  let wikiService: jest.Mocked<WikiService>;

  beforeEach(async () => {
    const mockWikiService = {
      createCategory: jest.fn(),
      findAllCategories: jest.fn(),
      updateCategory: jest.fn(),
      deleteCategory: jest.fn(),
      createArticle: jest.fn(),
      findAllArticles: jest.fn(),
      findOneArticle: jest.fn(),
      updateArticle: jest.fn(),
      deleteArticle: jest.fn(),
      findAllTags: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WikiController],
      providers: [{ provide: WikiService, useValue: mockWikiService }],
    }).compile();

    controller = module.get<WikiController>(WikiController);
    wikiService = module.get(WikiService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
