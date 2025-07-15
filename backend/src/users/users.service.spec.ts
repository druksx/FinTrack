import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { UpdateProfileDto, ChangePasswordDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'John Doe',
    image: 'https://example.com/avatar.jpg',
    password: 'hashedPassword123',
    createdAt: new Date('2024-03-15T10:30:00Z'),
    updatedAt: new Date('2024-03-15T10:30:00Z'),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const userWithoutPassword = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        image: mockUser.image,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);

      const result = await service.getProfile(userId);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
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
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        name: userWithoutPassword.name,
        image: userWithoutPassword.image,
        createdAt: userWithoutPassword.createdAt,
        updatedAt: userWithoutPassword.updatedAt,
      });
    });

    it('should return user profile with null name and image as undefined', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const userWithNulls = {
        id: mockUser.id,
        email: mockUser.email,
        name: null,
        image: null,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithNulls);

      const result = await service.getProfile(userId);

      expect(result).toEqual({
        id: userWithNulls.id,
        email: userWithNulls.email,
        name: undefined,
        image: undefined,
        createdAt: userWithNulls.createdAt,
        updatedAt: userWithNulls.updatedAt,
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      const userId = 'nonexistent-id';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile(userId)).rejects.toThrow(
        new NotFoundException(`User with ID ${userId} not found`),
      );
    });

    it('should handle database errors', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockPrismaService.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(service.getProfile(userId)).rejects.toThrow('Database error');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateProfileDto: UpdateProfileDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const updatedUser = {
        id: mockUser.id,
        name: 'Updated Name',
        email: 'updated@example.com',
        image: mockUser.image,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(userId, updateProfileDto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          name: updateProfileDto.name,
          email: updateProfileDto.email,
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
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      });
    });

    it('should update profile with only name', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateProfileDto: UpdateProfileDto = {
        email: 'test@example.com',
        name: 'New Name',
      };

      const updatedUser = {
        id: mockUser.id,
        email: 'test@example.com',
        name: 'New Name',
        image: mockUser.image,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(userId, updateProfileDto);

      expect(result.name).toBe('New Name');
      expect(result.email).toBe('test@example.com');
    });

    it('should handle null name and image as undefined', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateProfileDto: UpdateProfileDto = {
        email: 'test@example.com',
        name: 'Test',
      };

      const updatedUser = {
        id: mockUser.id,
        email: 'test@example.com',
        name: null,
        image: null,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(userId, updateProfileDto);

      expect(result.name).toBeUndefined();
      expect(result.image).toBeUndefined();
    });

    it('should handle user not found during update', async () => {
      const userId = 'nonexistent-id';
      const updateProfileDto: UpdateProfileDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      mockPrismaService.user.update.mockRejectedValue(new Error('Record not found'));

      await expect(service.updateProfile(userId, updateProfileDto)).rejects.toThrow('Record not found');
    });

    it('should handle duplicate email error', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateProfileDto: UpdateProfileDto = {
        name: 'John Doe',
        email: 'existing@example.com',
      };

      const prismaError = { code: 'P2002' };
      mockPrismaService.user.update.mockRejectedValue(prismaError);

      await expect(service.updateProfile(userId, updateProfileDto)).rejects.toBe(prismaError);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'currentPassword123',
        newPassword: 'newPassword123',
      };

      const userWithPassword = {
        id: mockUser.id,
        password: mockUser.password,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      mockPrismaService.user.update.mockResolvedValue({});

      await service.changePassword(userId, changePasswordDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          password: true,
        },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
        userWithPassword.password,
      );

      expect(bcrypt.hash).toHaveBeenCalledWith(changePasswordDto.newPassword, 12);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          password: 'hashedNewPassword',
        },
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      const userId = 'nonexistent-id';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'currentPassword123',
        newPassword: 'newPassword123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.changePassword(userId, changePasswordDto)).rejects.toThrow(
        new NotFoundException(`User with ID ${userId} not found`),
      );

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should throw error when user has no password (OAuth user)', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'currentPassword123',
        newPassword: 'newPassword123',
      };

      const oauthUser = {
        id: mockUser.id,
        password: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(oauthUser);

      await expect(service.changePassword(userId, changePasswordDto)).rejects.toThrow(
        'User has no password set (OAuth user)',
      );

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should throw error when current password is invalid', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123',
      };

      const userWithPassword = {
        id: mockUser.id,
        password: mockUser.password,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword(userId, changePasswordDto)).rejects.toThrow(
        'Invalid current password',
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
        userWithPassword.password,
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should handle bcrypt comparison errors', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'currentPassword123',
        newPassword: 'newPassword123',
      };

      const userWithPassword = {
        id: mockUser.id,
        password: mockUser.password,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithPassword);
      (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Bcrypt error'));

      await expect(service.changePassword(userId, changePasswordDto)).rejects.toThrow('Bcrypt error');
    });

    it('should handle database update errors', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'currentPassword123',
        newPassword: 'newPassword123',
      };

      const userWithPassword = {
        id: mockUser.id,
        password: mockUser.password,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      mockPrismaService.user.update.mockRejectedValue(new Error('Database error'));

      await expect(service.changePassword(userId, changePasswordDto)).rejects.toThrow('Database error');
    });
  });
}); 