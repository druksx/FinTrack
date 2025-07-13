import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesService } from './expenses.service';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let prismaService: PrismaService;
  const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        {
          provide: PrismaService,
          useValue: {
            expense: {
              create: jest.fn().mockResolvedValue({
                id: '1',
                amount: new Decimal(100),
                date: new Date(),
                note: 'Test expense',
                userId: DEFAULT_USER_ID,
                categoryId: '1',
                category: {
                  id: '1',
                  name: 'Test Category',
                  color: '#000000',
                  icon: 'Star',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
              findMany: jest.fn().mockResolvedValue([
                {
                  id: '1',
                  amount: new Decimal(100),
                  date: new Date(),
                  note: 'Test expense',
                  userId: DEFAULT_USER_ID,
                  categoryId: '1',
                  category: {
                    id: '1',
                    name: 'Test Category',
                    color: '#000000',
                    icon: 'Star',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  },
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ]),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an expense', async () => {
    const date = new Date();
    const expense = await service.create({
      amount: "100",
      date: date.toISOString(),
      note: 'Test expense',
      categoryId: '1',
    });
    expect(expense).toHaveProperty('id');
    expect(expense.category).toHaveProperty('icon');
  });

  it('should find all expenses', async () => {
    const expenses = await service.findAll();
    expect(expenses).toHaveLength(1);
    expect(expenses[0].category).toHaveProperty('icon');
  });
});
