import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdateProfileDto, ChangePasswordDto, UserDto } from './dto/user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser: UserDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'John Doe',
    image: 'https://example.com/avatar.jpg',
    createdAt: new Date('2024-03-15T10:30:00Z'),
    updatedAt: new Date('2024-03-15T10:30:00Z'),
  };

  const mockUsersService = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockUsersService.getProfile.mockResolvedValue(mockUser);

      const result = await controller.getProfile(userId);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.getProfile).toHaveBeenCalledWith(userId);
    });

    it('should handle user not found', async () => {
      const userId = 'nonexistent-id';
      mockUsersService.getProfile.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(controller.getProfile(userId)).rejects.toThrow(
        'User not found',
      );
      expect(mockUsersService.getProfile).toHaveBeenCalledWith(userId);
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
        ...mockUser,
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      mockUsersService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(userId, updateProfileDto);

      expect(result).toEqual(updatedUser);
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(
        userId,
        updateProfileDto,
      );
    });

    it('should update profile with only name', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateProfileDto: UpdateProfileDto = {
        email: 'test@example.com',
        name: 'New Name',
      };

      const updatedUser = {
        ...mockUser,
        name: 'New Name',
      };

      mockUsersService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(userId, updateProfileDto);

      expect(result).toEqual(updatedUser);
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(
        userId,
        updateProfileDto,
      );
    });

    it('should handle email already exists error', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateProfileDto: UpdateProfileDto = {
        name: 'John Doe',
        email: 'existing@example.com',
      };

      const prismaError = { code: 'P2002' };
      mockUsersService.updateProfile.mockRejectedValue(prismaError);

      await expect(
        controller.updateProfile(userId, updateProfileDto),
      ).rejects.toThrow(
        new HttpException('Email already exists', HttpStatus.BAD_REQUEST),
      );
    });

    it('should handle other update errors', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateProfileDto: UpdateProfileDto = {
        name: 'John Doe',
        email: 'test@example.com',
      };

      mockUsersService.updateProfile.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        controller.updateProfile(userId, updateProfileDto),
      ).rejects.toThrow(
        new HttpException(
          'Failed to update profile',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'currentPassword123',
        newPassword: 'newPassword123',
      };

      mockUsersService.changePassword.mockResolvedValue(undefined);

      const result = await controller.changePassword(userId, changePasswordDto);

      expect(result).toEqual({ message: 'Password changed successfully' });
      expect(mockUsersService.changePassword).toHaveBeenCalledWith(
        userId,
        changePasswordDto,
      );
    });

    it('should handle invalid current password', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123',
      };

      mockUsersService.changePassword.mockRejectedValue(
        new Error('Invalid current password'),
      );

      await expect(
        controller.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(
        new HttpException('Invalid current password', HttpStatus.BAD_REQUEST),
      );
    });

    it('should handle user not found', async () => {
      const userId = 'nonexistent-id';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'currentPassword123',
        newPassword: 'newPassword123',
      };

      mockUsersService.changePassword.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(
        controller.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(
        new HttpException(
          'Failed to change password',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });

    it('should handle OAuth user (no password set)', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'currentPassword123',
        newPassword: 'newPassword123',
      };

      mockUsersService.changePassword.mockRejectedValue(
        new Error('User has no password set (OAuth user)'),
      );

      await expect(
        controller.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(
        new HttpException(
          'Failed to change password',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });

    it('should handle other password change errors', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'currentPassword123',
        newPassword: 'newPassword123',
      };

      mockUsersService.changePassword.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        controller.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(
        new HttpException(
          'Failed to change password',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
