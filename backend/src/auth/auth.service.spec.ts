import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, OAuthDto } from './dto/auth.dto';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'John Doe',
    image: null,
    password: 'hashedPassword123',
    createdAt: new Date('2024-03-15T10:30:00Z'),
    updatedAt: new Date('2024-03-15T10:30:00Z'),
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user with name', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'securePassword123',
        name: 'John Doe',
      };

      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const createdUser = {
        ...mockUser,
        password: undefined, // Selected fields don't include password
      };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.createUser(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          name: registerDto.name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result).toEqual({
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        image: createdUser.image,
        createdAt: createdUser.createdAt.toISOString(),
        updatedAt: createdUser.updatedAt.toISOString(),
      });
    });

    it('should create a new user without name', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'securePassword123',
      };

      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const createdUser = {
        ...mockUser,
        name: null,
        password: undefined,
      };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.createUser(registerDto);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          name: null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result.name).toBeNull();
    });

    it('should throw error when user creation fails', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'securePassword123',
        name: 'John Doe',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      mockPrismaService.user.create.mockRejectedValue(new Error('Database error'));

      await expect(service.createUser(registerDto)).rejects.toThrow('Database error');
    });
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'securePassword123';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          password: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        image: mockUser.image,
        createdAt: mockUser.createdAt.toISOString(),
        updatedAt: mockUser.updatedAt.toISOString(),
      });
    });

    it('should return null when user is not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'securePassword123';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when user has no password (OAuth user)', async () => {
      const email = 'oauth@example.com';
      const password = 'securePassword123';

      const oauthUser = {
        ...mockUser,
        password: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(oauthUser);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
    });

    it('should throw error when database query fails', async () => {
      const email = 'test@example.com';
      const password = 'securePassword123';

      mockPrismaService.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(service.validateUser(email, password)).rejects.toThrow('Database error');
    });
  });

  describe('findOrCreateOAuthUser', () => {
    it('should return existing user and update their data', async () => {
      const oauthDto: OAuthDto = {
        email: 'existing@example.com',
        name: 'Updated Name',
        image: 'https://example.com/new-avatar.jpg',
        provider: 'google',
        providerAccountId: '123456789',
      };

      const existingUser = {
        ...mockUser,
        email: 'existing@example.com',
        name: 'Old Name',
        image: 'https://example.com/old-avatar.jpg',
      };

      const updatedUser = {
        id: existingUser.id,
        email: existingUser.email,
        name: 'Updated Name',
        image: 'https://example.com/new-avatar.jpg',
        createdAt: existingUser.createdAt,
        updatedAt: existingUser.updatedAt,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.findOrCreateOAuthUser(oauthDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: oauthDto.email },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: existingUser.id },
        data: {
          name: oauthDto.name,
          image: oauthDto.image,
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result).toEqual({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      });
    });

    it('should preserve existing user data when OAuth data is missing', async () => {
      const oauthDto: OAuthDto = {
        email: 'existing@example.com',
        provider: 'google',
        providerAccountId: '123456789',
      };

      const existingUser = {
        ...mockUser,
        email: 'existing@example.com',
        name: 'Existing Name',
        image: 'https://example.com/existing-avatar.jpg',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue(existingUser);

      const result = await service.findOrCreateOAuthUser(oauthDto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: existingUser.id },
        data: {
          name: existingUser.name, // Should preserve existing name
          image: existingUser.image, // Should preserve existing image
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result.name).toBe('Existing Name');
      expect(result.image).toBe('https://example.com/existing-avatar.jpg');
    });

    it('should create new user when user does not exist', async () => {
      const oauthDto: OAuthDto = {
        email: 'new@example.com',
        name: 'New User',
        image: 'https://example.com/avatar.jpg',
        provider: 'github',
        providerAccountId: '987654321',
      };

      const newUser = {
        id: mockUser.id,
        email: 'new@example.com',
        name: 'New User',
        image: 'https://example.com/avatar.jpg',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(newUser);

      const result = await service.findOrCreateOAuthUser(oauthDto);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: oauthDto.email,
          name: oauthDto.name,
          image: oauthDto.image,
          password: null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result).toEqual({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        image: newUser.image,
        createdAt: newUser.createdAt.toISOString(),
        updatedAt: newUser.updatedAt.toISOString(),
      });
    });

    it('should create new user with null name and image when not provided', async () => {
      const oauthDto: OAuthDto = {
        email: 'minimal@example.com',
        provider: 'facebook',
        providerAccountId: '111222333',
      };

      const newUser = {
        id: mockUser.id,
        email: 'minimal@example.com',
        name: null,
        image: null,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(newUser);

      const result = await service.findOrCreateOAuthUser(oauthDto);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: oauthDto.email,
          name: null,
          image: null,
          password: null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result.name).toBeNull();
      expect(result.image).toBeNull();
    });

    it('should throw error when database operation fails', async () => {
      const oauthDto: OAuthDto = {
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        provider: 'google',
        providerAccountId: '123456789',
      };

      mockPrismaService.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(service.findOrCreateOAuthUser(oauthDto)).rejects.toThrow('Database error');
    });
  });
}); 