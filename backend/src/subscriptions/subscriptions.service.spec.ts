import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Prisma } from '@prisma/client';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let prismaService: PrismaService;

  const mockSubscription = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Netflix',
    amount: new Prisma.Decimal(15.99),
    logoUrl: 'https://example.com/netflix-logo.png',
    recurrence: 'MONTHLY',
    startDate: new Date('2024-03-15'),
    nextPayment: new Date('2024-04-15'),
    categoryId: 'cat123',
    userId: 'user123',
    createdAt: new Date('2024-03-15T10:30:00.000Z'),
    updatedAt: new Date('2024-03-15T10:30:00.000Z'),
    category: {
      id: 'cat123',
      name: 'Entertainment',
      color: '#FF5733',
      icon: 'movie',
    },
  };

  const mockPrismaService = {
    subscription: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-03-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a monthly subscription', async () => {
      const createSubscriptionDto: CreateSubscriptionDto = {
        name: 'Netflix',
        amount: 15.99,
        logoUrl: 'https://example.com/netflix-logo.png',
        recurrence: 'MONTHLY',
        startDate: '2024-03-15',
        categoryId: 'cat123',
      };

      const userId = 'user123';

      mockPrismaService.subscription.create.mockResolvedValue(mockSubscription);

      const result = await service.create(createSubscriptionDto, userId);

      expect(mockPrismaService.subscription.create).toHaveBeenCalledWith({
        data: {
          name: 'Netflix',
          amount: new Prisma.Decimal(15.99),
          logoUrl: 'https://example.com/netflix-logo.png',
          recurrence: 'MONTHLY',
          startDate: new Date('2024-03-15T00:00:00.000Z'),
          nextPayment: expect.any(Date),
          categoryId: 'cat123',
          userId: 'user123',
        },
        include: {
          category: true,
        },
      });

      expect(result).toEqual({
        id: mockSubscription.id,
        name: mockSubscription.name,
        amount: '15.99',
        logoUrl: mockSubscription.logoUrl,
        recurrence: mockSubscription.recurrence,
        startDate: mockSubscription.startDate.toISOString(),
        nextPayment: mockSubscription.nextPayment.toISOString(),
        categoryId: mockSubscription.categoryId,
        userId: mockSubscription.userId,
        category: mockSubscription.category,
        createdAt: mockSubscription.createdAt.toISOString(),
        updatedAt: mockSubscription.updatedAt.toISOString(),
      });
    });

    it('should create an annual subscription', async () => {
      const createSubscriptionDto: CreateSubscriptionDto = {
        name: 'Adobe Creative Cloud',
        amount: 599.99,
        recurrence: 'ANNUALLY',
        startDate: '2024-03-15',
        categoryId: 'cat123',
      };

      const userId = 'user123';

      const annualSubscription = {
        ...mockSubscription,
        name: 'Adobe Creative Cloud',
        amount: new Prisma.Decimal(599.99),
        recurrence: 'ANNUALLY',
        nextPayment: new Date('2025-03-15'),
      };

      mockPrismaService.subscription.create.mockResolvedValue(
        annualSubscription,
      );

      const result = await service.create(createSubscriptionDto, userId);

      expect(mockPrismaService.subscription.create).toHaveBeenCalledWith({
        data: {
          name: 'Adobe Creative Cloud',
          amount: new Prisma.Decimal(599.99),
          logoUrl: undefined,
          recurrence: 'ANNUALLY',
          startDate: new Date('2024-03-15T00:00:00.000Z'),
          nextPayment: expect.any(Date),
          categoryId: 'cat123',
          userId: 'user123',
        },
        include: {
          category: true,
        },
      });

      expect(result.recurrence).toBe('ANNUALLY');
      expect(result.amount).toBe('599.99');
    });

    it('should create subscription without logo', async () => {
      const createSubscriptionDto: CreateSubscriptionDto = {
        name: 'Spotify',
        amount: 9.99,
        recurrence: 'MONTHLY',
        startDate: '2024-03-15',
        categoryId: 'cat123',
      };

      const userId = 'user123';

      const subscriptionWithoutLogo = {
        ...mockSubscription,
        logoUrl: null,
      };

      mockPrismaService.subscription.create.mockResolvedValue(
        subscriptionWithoutLogo,
      );

      const result = await service.create(createSubscriptionDto, userId);

      expect(result.logoUrl).toBeNull();
    });

    it('should handle database errors', async () => {
      const createSubscriptionDto: CreateSubscriptionDto = {
        name: 'Netflix',
        amount: 15.99,
        recurrence: 'MONTHLY',
        startDate: '2024-03-15',
        categoryId: 'cat123',
      };

      const userId = 'user123';

      mockPrismaService.subscription.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.create(createSubscriptionDto, userId),
      ).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all subscriptions for a user', async () => {
      const userId = 'user123';
      const subscriptions = [mockSubscription];

      mockPrismaService.subscription.findMany.mockResolvedValue(subscriptions);

      const result = await service.findAll(userId);

      expect(mockPrismaService.subscription.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          category: true,
        },
        orderBy: {
          startDate: 'asc',
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockSubscription.id,
        name: mockSubscription.name,
        amount: '15.99',
        logoUrl: mockSubscription.logoUrl,
        recurrence: mockSubscription.recurrence,
        startDate: mockSubscription.startDate.toISOString(),
        nextPayment: mockSubscription.nextPayment.toISOString(),
        categoryId: mockSubscription.categoryId,
        userId: mockSubscription.userId,
        category: mockSubscription.category,
        createdAt: mockSubscription.createdAt.toISOString(),
        updatedAt: mockSubscription.updatedAt.toISOString(),
      });
    });

    it('should return empty array when no subscriptions exist', async () => {
      const userId = 'user123';

      mockPrismaService.subscription.findMany.mockResolvedValue([]);

      const result = await service.findAll(userId);

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const userId = 'user123';

      mockPrismaService.subscription.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.findAll(userId)).rejects.toThrow('Database error');
    });
  });

  describe('findAllForMonth', () => {
    it('should return monthly subscriptions for a specific month', async () => {
      const userId = 'user123';
      const year = 2024;
      const month = 3;

      const subscriptions = [
        {
          ...mockSubscription,
          startDate: new Date('2024-02-15'),
        },
      ];

      mockPrismaService.subscription.findMany.mockResolvedValue(subscriptions);

      const result = await service.findAllForMonth(year, month, userId);

      expect(mockPrismaService.subscription.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          OR: [
            {
              recurrence: 'MONTHLY',
              startDate: {
                lte: new Date(2024, 2, 31),
              },
            },
            {
              recurrence: 'ANNUALLY',
              startDate: {
                lte: new Date(2024, 2, 31),
              },
            },
          ],
        },
        include: {
          category: true,
        },
        orderBy: {
          startDate: 'asc',
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].nextPayment).toBe(new Date(2024, 2, 15).toISOString());
    });

    it('should handle annual subscriptions correctly', async () => {
      const userId = 'user123';
      const year = 2024;
      const month = 3;

      const annualSubscriptions = [
        {
          ...mockSubscription,
          recurrence: 'ANNUALLY',
          startDate: new Date('2023-03-15'),
        },
      ];

      mockPrismaService.subscription.findMany.mockResolvedValue(
        annualSubscriptions,
      );

      const result = await service.findAllForMonth(year, month, userId);

      expect(result).toHaveLength(1);
      expect(result[0].nextPayment).toBe(
        new Date('2024-03-15T00:00:00.000Z').toISOString(),
      );
    });

    it('should filter out subscriptions with invalid dates for the month', async () => {
      const userId = 'user123';
      const year = 2024;
      const month = 2;

      const subscriptions = [
        {
          ...mockSubscription,
          startDate: new Date('2024-01-31'),
        },
      ];

      mockPrismaService.subscription.findMany.mockResolvedValue(subscriptions);

      const result = await service.findAllForMonth(year, month, userId);

      expect(result).toHaveLength(0);
    });

    it('should return empty array when no subscriptions for month', async () => {
      const userId = 'user123';
      const year = 2024;
      const month = 1;

      mockPrismaService.subscription.findMany.mockResolvedValue([]);

      const result = await service.findAllForMonth(year, month, userId);

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const userId = 'user123';
      const year = 2024;
      const month = 3;

      mockPrismaService.subscription.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.findAllForMonth(year, month, userId),
      ).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('should update a subscription', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateData: Partial<CreateSubscriptionDto> = {
        name: 'Netflix Premium',
        amount: 19.99,
      };
      const userId = 'user123';

      const existingSubscription = {
        ...mockSubscription,
        id,
      };

      const updatedSubscription = {
        ...existingSubscription,
        name: 'Netflix Premium',
        amount: new Prisma.Decimal(19.99),
      };

      mockPrismaService.subscription.findUnique.mockResolvedValue(
        existingSubscription,
      );
      mockPrismaService.subscription.update.mockResolvedValue(
        updatedSubscription,
      );

      const result = await service.update(id, updateData, userId);

      expect(mockPrismaService.subscription.findUnique).toHaveBeenCalledWith({
        where: { id },
      });

      expect(mockPrismaService.subscription.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          name: 'Netflix Premium',
          amount: new Prisma.Decimal(19.99),
          logoUrl: undefined,
          recurrence: undefined,
          startDate: undefined,
          categoryId: undefined,
          nextPayment: expect.any(Date),
        },
        include: {
          category: true,
        },
      });

      expect(result.name).toBe('Netflix Premium');
      expect(result.amount).toBe('19.99');
    });

    it('should update subscription with start date', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateData: Partial<CreateSubscriptionDto> = {
        startDate: '2024-04-01',
      };
      const userId = 'user123';

      const existingSubscription = {
        ...mockSubscription,
        id,
      };

      const updatedSubscription = {
        ...existingSubscription,
        startDate: new Date('2024-04-01'),
      };

      mockPrismaService.subscription.findUnique.mockResolvedValue(
        existingSubscription,
      );
      mockPrismaService.subscription.update.mockResolvedValue(
        updatedSubscription,
      );

      const result = await service.update(id, updateData, userId);

      expect(mockPrismaService.subscription.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          name: undefined,
          amount: undefined,
          logoUrl: undefined,
          recurrence: undefined,
          startDate: new Date('2024-04-01T00:00:00.000Z'),
          categoryId: undefined,
          nextPayment: expect.any(Date),
        },
        include: {
          category: true,
        },
      });

      expect(result.startDate).toBe(new Date('2024-04-01').toISOString());
    });

    it('should update subscription recurrence', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateData: Partial<CreateSubscriptionDto> = {
        recurrence: 'ANNUALLY',
      };
      const userId = 'user123';

      const existingSubscription = {
        ...mockSubscription,
        id,
      };

      const updatedSubscription = {
        ...existingSubscription,
        recurrence: 'ANNUALLY',
      };

      mockPrismaService.subscription.findUnique.mockResolvedValue(
        existingSubscription,
      );
      mockPrismaService.subscription.update.mockResolvedValue(
        updatedSubscription,
      );

      const result = await service.update(id, updateData, userId);

      expect(result.recurrence).toBe('ANNUALLY');
    });

    it('should throw NotFoundException when subscription not found', async () => {
      const id = 'nonexistent-id';
      const updateData: Partial<CreateSubscriptionDto> = {
        name: 'Netflix Premium',
      };
      const userId = 'user123';

      mockPrismaService.subscription.findUnique.mockResolvedValue(null);

      await expect(service.update(id, updateData, userId)).rejects.toThrow(
        new NotFoundException(`Subscription with ID ${id} not found`),
      );
    });

    it('should handle database errors', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateData: Partial<CreateSubscriptionDto> = {
        name: 'Netflix Premium',
      };
      const userId = 'user123';

      mockPrismaService.subscription.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.update(id, updateData, userId)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('delete', () => {
    it('should delete a subscription', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'user123';

      mockPrismaService.subscription.delete.mockResolvedValue(mockSubscription);

      const result = await service.delete(id, userId);

      expect(mockPrismaService.subscription.delete).toHaveBeenCalledWith({
        where: { id },
      });

      expect(result).toBeUndefined();
    });

    it('should handle database errors', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'user123';

      mockPrismaService.subscription.delete.mockRejectedValue(
        new Error('Subscription not found'),
      );

      await expect(service.delete(id, userId)).rejects.toThrow(
        'Subscription not found',
      );
    });
  });

  describe('calculateNextPayment (private method testing through public methods)', () => {
    it('should calculate next payment for monthly subscription correctly', async () => {
      jest.setSystemTime(new Date('2024-03-01T00:00:00.000Z'));

      const createSubscriptionDto: CreateSubscriptionDto = {
        name: 'Netflix',
        amount: 15.99,
        recurrence: 'MONTHLY',
        startDate: '2024-03-15',
        categoryId: 'cat123',
      };

      const userId = 'user123';

      const subscriptionWithCalculatedDate = {
        ...mockSubscription,
        nextPayment: new Date('2024-03-15'),
      };

      mockPrismaService.subscription.create.mockResolvedValue(
        subscriptionWithCalculatedDate,
      );

      const result = await service.create(createSubscriptionDto, userId);

      expect(result.nextPayment).toBe(new Date('2024-03-15').toISOString());
    });

    it('should calculate next payment for annual subscription correctly', async () => {
      jest.setSystemTime(new Date('2024-03-01T00:00:00.000Z'));

      const createSubscriptionDto: CreateSubscriptionDto = {
        name: 'Adobe Creative Cloud',
        amount: 599.99,
        recurrence: 'ANNUALLY',
        startDate: '2023-03-15',
        categoryId: 'cat123',
      };

      const userId = 'user123';

      const annualSubscriptionWithCalculatedDate = {
        ...mockSubscription,
        recurrence: 'ANNUALLY',
        nextPayment: new Date('2024-03-15'),
      };

      mockPrismaService.subscription.create.mockResolvedValue(
        annualSubscriptionWithCalculatedDate,
      );

      const result = await service.create(createSubscriptionDto, userId);

      expect(result.nextPayment).toBe(new Date('2024-03-15').toISOString());
    });
  });
});
