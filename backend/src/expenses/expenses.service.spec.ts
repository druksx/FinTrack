import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesService } from './expenses.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { NotFoundException } from '@nestjs/common';

const TEST_USER_ID = '00000000-0000-0000-0000-000000000000';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let prisma: PrismaService;

  const mockExpense = {
    id: '1',
    amount: 100,
    date: new Date('2024-03-15'),
    note: 'Test expense',
    categoryId: 'cat1',
    userId: TEST_USER_ID,
    category: {
      id: 'cat1',
      name: 'Food',
      icon: '🍕',
    },
  };

  const mockPrismaService = {
    expense: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create an expense', async () => {
      const createExpenseDto: CreateExpenseDto = {
        amount: "100",
        date: '2024-03-15',
        categoryId: 'cat1',
        note: 'Test expense',
      };

      mockPrismaService.expense.create.mockResolvedValue(mockExpense);

      const result = await service.create(createExpenseDto, TEST_USER_ID);

      expect(prisma.expense.create).toHaveBeenCalledWith({
        data: {
          amount: expect.any(Object), // Prisma.Decimal
          date: expect.any(Date),
          categoryId: 'cat1',
          note: 'Test expense',
          userId: TEST_USER_ID,
        },
        include: {
          category: true,
        },
      });

      expect(result).toEqual({
        id: '1',
        amount: 100,
        date: '2024-03-15T00:00:00.000Z',
        note: 'Test expense',
        categoryId: 'cat1',
        categoryName: 'Food',
        categoryIcon: '🍕',
      });
    });
  });

  describe('findAll', () => {
    it('should return all expenses for a user', async () => {
      mockPrismaService.expense.findMany.mockResolvedValue([mockExpense]);

      const result = await service.findAll(TEST_USER_ID);

      expect(prisma.expense.findMany).toHaveBeenCalledWith({
        where: {
          userId: TEST_USER_ID,
        },
        include: {
          category: true,
        },
        orderBy: {
          date: 'desc',
        },
      });

      expect(result).toHaveLength(1);
    });
  });
});
