import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

describe('ExpensesController', () => {
  let controller: ExpensesController;
  let service: ExpensesService;

  const mockExpense = {
    id: 'expense-id',
    note: 'Test expense',
    amount: '25.99',
    date: '2024-03-15T00:00:00.000Z',
    categoryId: 'category-id',
    userId: 'user-id',
    createdAt: new Date('2024-03-15T10:30:00.000Z'),
    updatedAt: new Date('2024-03-15T10:30:00.000Z'),
    category: {
      id: 'category-id',
      name: 'Food',
      color: '#FF5733',
      icon: 'utensils',
    },
  };

  const mockDashboardData = {
    totalExpenses: '100.00',
    totalBudget: '500.00',
    remainingBudget: '400.00',
    subscriptionsCost: '50.00',
    expensesByCategory: [],
    dailyExpenses: [],
    previousMonthTotal: '80.00',
    comparisonPercentage: 25,
  };

  const mockExpensesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getDashboardData: jest.fn(),
    getExpensesForExport: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [
        {
          provide: ExpensesService,
          useValue: mockExpensesService,
        },
      ],
    }).compile();

    controller = module.get<ExpensesController>(ExpensesController);
    service = module.get<ExpensesService>(ExpensesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new expense', async () => {
      const createExpenseDto: CreateExpenseDto = {
        note: 'Test expense',
        amount: '25.99',
        date: '2024-03-15',
        categoryId: 'category-id',
      };

      mockExpensesService.create.mockResolvedValue(mockExpense);

      const result = await controller.create(createExpenseDto, 'user-id');

      expect(result).toEqual(mockExpense);
      expect(mockExpensesService.create).toHaveBeenCalledWith(
        createExpenseDto,
        'user-id',
      );
    });

    it('should handle service errors', async () => {
      const createExpenseDto: CreateExpenseDto = {
        note: 'Test expense',
        amount: '25.99',
        date: '2024-03-15',
        categoryId: 'category-id',
      };

      mockExpensesService.create.mockRejectedValue(new Error('Database error'));

      await expect(
        controller.create(createExpenseDto, 'user-id'),
      ).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all expenses for a user', async () => {
      const expenses = [mockExpense];
      mockExpensesService.findAll.mockResolvedValue(expenses);

      const result = await controller.findAll({}, 'user-id');

      expect(result).toEqual(expenses);
      expect(mockExpensesService.findAll).toHaveBeenCalledWith(
        'user-id',
        undefined,
      );
    });

    it('should return expenses for a specific month', async () => {
      const expenses = [mockExpense];
      mockExpensesService.findAll.mockResolvedValue(expenses);

      const result = await controller.findAll({ month: '2024-03' }, 'user-id');

      expect(result).toEqual(expenses);
      expect(mockExpensesService.findAll).toHaveBeenCalledWith(
        'user-id',
        '2024-03',
      );
    });

    it('should handle service errors', async () => {
      mockExpensesService.findAll.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.findAll({}, 'user-id')).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('update', () => {
    it('should update an expense', async () => {
      const updateData: CreateExpenseDto = {
        note: 'Updated expense',
        amount: '30.00',
        date: '2024-03-15',
        categoryId: 'category-id',
      };

      const updatedExpense = {
        ...mockExpense,
        note: 'Updated expense',
        amount: '30.00',
      };

      mockExpensesService.update.mockResolvedValue(updatedExpense);

      const result = await controller.update(
        'expense-id',
        updateData,
        'user-id',
      );

      expect(result).toEqual(updatedExpense);
      expect(mockExpensesService.update).toHaveBeenCalledWith(
        'expense-id',
        updateData,
        'user-id',
      );
    });

    it('should handle service errors', async () => {
      const updateData: CreateExpenseDto = {
        note: 'Updated expense',
        amount: '25.99',
        date: '2024-03-15',
        categoryId: 'category-id',
      };

      mockExpensesService.update.mockRejectedValue(
        new Error('Expense not found'),
      );

      await expect(
        controller.update('expense-id', updateData, 'user-id'),
      ).rejects.toThrow('Expense not found');
    });
  });

  describe('delete', () => {
    it('should delete an expense', async () => {
      mockExpensesService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('expense-id', 'user-id');

      expect(result).toBeUndefined();
      expect(mockExpensesService.delete).toHaveBeenCalledWith(
        'expense-id',
        'user-id',
      );
    });

    it('should handle service errors', async () => {
      mockExpensesService.delete.mockRejectedValue(
        new Error('Expense not found'),
      );

      await expect(controller.delete('expense-id', 'user-id')).rejects.toThrow(
        'Expense not found',
      );
    });
  });

  describe('getDashboardData', () => {
    it('should return dashboard data', async () => {
      mockExpensesService.getDashboardData.mockResolvedValue(mockDashboardData);

      const result = await controller.getDashboardData({}, 'user-id');

      expect(result).toEqual(mockDashboardData);
      expect(mockExpensesService.getDashboardData).toHaveBeenCalledWith(
        'user-id',
        undefined,
      );
    });

    it('should return dashboard data for specific month', async () => {
      mockExpensesService.getDashboardData.mockResolvedValue(mockDashboardData);

      const result = await controller.getDashboardData(
        { month: '2024-03' },
        'user-id',
      );

      expect(result).toEqual(mockDashboardData);
      expect(mockExpensesService.getDashboardData).toHaveBeenCalledWith(
        'user-id',
        '2024-03',
      );
    });

    it('should handle service errors', async () => {
      mockExpensesService.getDashboardData.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.getDashboardData({}, 'user-id')).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('getExpensesForExport', () => {
    it('should return expenses for export', async () => {
      const exportData = 'csv,data,here';
      mockExpensesService.getExpensesForExport.mockResolvedValue(exportData);

      const result = await controller.getExpensesForExport(
        '2024-03',
        'user-id',
      );

      expect(result).toEqual(exportData);
      expect(mockExpensesService.getExpensesForExport).toHaveBeenCalledWith(
        'user-id',
        '2024-03',
      );
    });

    it('should handle service errors', async () => {
      mockExpensesService.getExpensesForExport.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        controller.getExpensesForExport('2024-03', 'user-id'),
      ).rejects.toThrow('Database error');
    });
  });
});
