import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionDto } from './dto/subscription.dto';

describe('SubscriptionsController', () => {
  let controller: SubscriptionsController;
  let service: SubscriptionsService;

  const mockSubscription: SubscriptionDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Netflix',
    amount: '15.99',
    logoUrl: 'https://example.com/netflix-logo.png',
    recurrence: 'MONTHLY',
    startDate: '2024-03-15T00:00:00.000Z',
    nextPayment: '2024-04-15T00:00:00.000Z',
    categoryId: 'cat123',
    category: {
      id: 'cat123',
      name: 'Entertainment',
      color: '#FF5733',
      icon: 'movie',
    },
    createdAt: '2024-03-15T10:30:00.000Z',
    updatedAt: '2024-03-15T10:30:00.000Z',
  };

  const mockSubscriptionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllForMonth: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionsController],
      providers: [
        {
          provide: SubscriptionsService,
          useValue: mockSubscriptionsService,
        },
      ],
    }).compile();

    controller = module.get<SubscriptionsController>(SubscriptionsController);
    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new subscription', async () => {
      const userId = 'user123';
      const createSubscriptionDto: CreateSubscriptionDto = {
        name: 'Netflix',
        amount: 15.99,
        logoUrl: 'https://example.com/netflix-logo.png',
        recurrence: 'MONTHLY',
        startDate: '2024-03-15',
        categoryId: 'cat123',
      };

      mockSubscriptionsService.create.mockResolvedValue(mockSubscription);

      const result = await controller.create(createSubscriptionDto, userId);

      expect(result).toEqual(mockSubscription);
      expect(mockSubscriptionsService.create).toHaveBeenCalledWith(createSubscriptionDto, userId);
    });

    it('should create a subscription without logo', async () => {
      const userId = 'user123';
      const createSubscriptionDto: CreateSubscriptionDto = {
        name: 'Spotify',
        amount: 9.99,
        recurrence: 'MONTHLY',
        startDate: '2024-03-15',
        categoryId: 'cat123',
      };

      const subscriptionWithoutLogo = {
        ...mockSubscription,
        name: 'Spotify',
        amount: '9.99',
        logoUrl: undefined,
      };

      mockSubscriptionsService.create.mockResolvedValue(subscriptionWithoutLogo);

      const result = await controller.create(createSubscriptionDto, userId);

      expect(result).toEqual(subscriptionWithoutLogo);
      expect(mockSubscriptionsService.create).toHaveBeenCalledWith(createSubscriptionDto, userId);
    });

    it('should create an annual subscription', async () => {
      const userId = 'user123';
      const createSubscriptionDto: CreateSubscriptionDto = {
        name: 'Adobe Creative Cloud',
        amount: 599.99,
        recurrence: 'ANNUALLY',
        startDate: '2024-03-15',
        categoryId: 'cat123',
      };

      const annualSubscription = {
        ...mockSubscription,
        name: 'Adobe Creative Cloud',
        amount: '599.99',
        recurrence: 'ANNUALLY' as const,
        nextPayment: '2025-03-15T00:00:00.000Z',
      };

      mockSubscriptionsService.create.mockResolvedValue(annualSubscription);

      const result = await controller.create(createSubscriptionDto, userId);

      expect(result).toEqual(annualSubscription);
      expect(mockSubscriptionsService.create).toHaveBeenCalledWith(createSubscriptionDto, userId);
    });

    it('should handle service errors', async () => {
      const userId = 'user123';
      const createSubscriptionDto: CreateSubscriptionDto = {
        name: 'Netflix',
        amount: 15.99,
        recurrence: 'MONTHLY',
        startDate: '2024-03-15',
        categoryId: 'cat123',
      };

      mockSubscriptionsService.create.mockRejectedValue(new Error('Database error'));

      await expect(controller.create(createSubscriptionDto, userId)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all subscriptions for a user', async () => {
      const userId = 'user123';
      const subscriptions = [mockSubscription];

      mockSubscriptionsService.findAll.mockResolvedValue(subscriptions);

      const result = await controller.findAll(userId);

      expect(result).toEqual(subscriptions);
      expect(mockSubscriptionsService.findAll).toHaveBeenCalledWith(userId);
    });

    it('should return empty array when no subscriptions exist', async () => {
      const userId = 'user123';

      mockSubscriptionsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(userId);

      expect(result).toEqual([]);
      expect(mockSubscriptionsService.findAll).toHaveBeenCalledWith(userId);
    });

    it('should handle service errors', async () => {
      const userId = 'user123';

      mockSubscriptionsService.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll(userId)).rejects.toThrow('Database error');
    });
  });

  describe('findAllForMonth', () => {
    it('should return subscriptions for a specific month', async () => {
      const userId = 'user123';
      const year = '2024';
      const month = '3';
      const subscriptions = [mockSubscription];

      mockSubscriptionsService.findAllForMonth.mockResolvedValue(subscriptions);

      const result = await controller.findAllForMonth(year, month, userId);

      expect(result).toEqual(subscriptions);
      expect(mockSubscriptionsService.findAllForMonth).toHaveBeenCalledWith(2024, 3, userId);
    });

    it('should handle different year and month values', async () => {
      const userId = 'user123';
      const year = '2023';
      const month = '12';
      const subscriptions = [mockSubscription];

      mockSubscriptionsService.findAllForMonth.mockResolvedValue(subscriptions);

      const result = await controller.findAllForMonth(year, month, userId);

      expect(result).toEqual(subscriptions);
      expect(mockSubscriptionsService.findAllForMonth).toHaveBeenCalledWith(2023, 12, userId);
    });

    it('should return empty array when no subscriptions for month', async () => {
      const userId = 'user123';
      const year = '2024';
      const month = '1';

      mockSubscriptionsService.findAllForMonth.mockResolvedValue([]);

      const result = await controller.findAllForMonth(year, month, userId);

      expect(result).toEqual([]);
      expect(mockSubscriptionsService.findAllForMonth).toHaveBeenCalledWith(2024, 1, userId);
    });

    it('should handle service errors', async () => {
      const userId = 'user123';
      const year = '2024';
      const month = '3';

      mockSubscriptionsService.findAllForMonth.mockRejectedValue(new Error('Database error'));

      await expect(controller.findAllForMonth(year, month, userId)).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('should update a subscription', async () => {
      const userId = 'user123';
      const subscriptionId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData: Partial<CreateSubscriptionDto> = {
        name: 'Netflix Premium',
        amount: 19.99,
      };

      const updatedSubscription = {
        ...mockSubscription,
        name: 'Netflix Premium',
        amount: '19.99',
      };

      mockSubscriptionsService.update.mockResolvedValue(updatedSubscription);

      const result = await controller.update(subscriptionId, updateData, userId);

      expect(result).toEqual(updatedSubscription);
      expect(mockSubscriptionsService.update).toHaveBeenCalledWith(subscriptionId, updateData, userId);
    });

    it('should update subscription with partial data', async () => {
      const userId = 'user123';
      const subscriptionId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData: Partial<CreateSubscriptionDto> = {
        logoUrl: 'https://example.com/new-logo.png',
      };

      const updatedSubscription = {
        ...mockSubscription,
        logoUrl: 'https://example.com/new-logo.png',
      };

      mockSubscriptionsService.update.mockResolvedValue(updatedSubscription);

      const result = await controller.update(subscriptionId, updateData, userId);

      expect(result).toEqual(updatedSubscription);
      expect(mockSubscriptionsService.update).toHaveBeenCalledWith(subscriptionId, updateData, userId);
    });

    it('should update subscription recurrence', async () => {
      const userId = 'user123';
      const subscriptionId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData: Partial<CreateSubscriptionDto> = {
        recurrence: 'ANNUALLY',
        amount: 179.99,
      };

      const updatedSubscription = {
        ...mockSubscription,
        recurrence: 'ANNUALLY' as const,
        amount: '179.99',
        nextPayment: '2025-03-15T00:00:00.000Z',
      };

      mockSubscriptionsService.update.mockResolvedValue(updatedSubscription);

      const result = await controller.update(subscriptionId, updateData, userId);

      expect(result).toEqual(updatedSubscription);
      expect(mockSubscriptionsService.update).toHaveBeenCalledWith(subscriptionId, updateData, userId);
    });

    it('should handle service errors', async () => {
      const userId = 'user123';
      const subscriptionId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData: Partial<CreateSubscriptionDto> = {
        name: 'Netflix Premium',
      };

      mockSubscriptionsService.update.mockRejectedValue(new Error('Subscription not found'));

      await expect(controller.update(subscriptionId, updateData, userId)).rejects.toThrow('Subscription not found');
    });
  });

  describe('delete', () => {
    it('should delete a subscription', async () => {
      const userId = 'user123';
      const subscriptionId = '123e4567-e89b-12d3-a456-426614174000';

      mockSubscriptionsService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(subscriptionId, userId);

      expect(result).toBeUndefined();
      expect(mockSubscriptionsService.delete).toHaveBeenCalledWith(subscriptionId, userId);
    });

    it('should handle service errors', async () => {
      const userId = 'user123';
      const subscriptionId = 'nonexistent-id';

      mockSubscriptionsService.delete.mockRejectedValue(new Error('Subscription not found'));

      await expect(controller.delete(subscriptionId, userId)).rejects.toThrow('Subscription not found');
    });
  });
}); 