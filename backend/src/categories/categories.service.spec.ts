import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: {
            category: {
              create: jest.fn().mockResolvedValue({
                id: '1',
                name: 'Test',
                color: '#000000',
                icon: 'Star',
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
              findMany: jest.fn().mockResolvedValue([
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
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a category', async () => {
    const category = await service.create({
      name: 'Test',
      color: '#000000',
      icon: 'Star',
    }, 'test-user-id');
    expect(category).toHaveProperty('id');
    expect(category.name).toBe('Test');
    expect(category.color).toBe('#000000');
    expect(category.icon).toBe('Star');
  });

  it('should find all categories', async () => {
    const categories = await service.findAll('test-user-id');
    expect(categories).toHaveLength(1);
    expect(categories[0]).toHaveProperty('icon');
  });
});
