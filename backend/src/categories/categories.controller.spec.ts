import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            create: jest.fn().mockResolvedValue({
              id: '1',
              name: 'Test',
              color: '#000000',
              icon: 'Star',
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
            findAll: jest.fn().mockResolvedValue([
              {
                id: '1',
                name: 'Test',
                color: '#000000',
                icon: 'Star',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ]),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a category', async () => {
    const category = await controller.create({
      name: 'Test',
      color: '#000000',
      icon: 'Star',
    });
    expect(category).toHaveProperty('id');
    expect(category.name).toBe('Test');
    expect(category.color).toBe('#000000');
    expect(category.icon).toBe('Star');
  });

  it('should find all categories', async () => {
    const categories = await controller.findAll();
    expect(categories).toHaveLength(1);
    expect(categories[0]).toHaveProperty('icon');
  });
});
