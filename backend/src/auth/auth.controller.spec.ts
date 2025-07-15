import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RegisterDto, LoginDto, OAuthDto, UserResponseDto } from './dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockUser: UserResponseDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'John Doe',
    image: null,
    createdAt: '2024-03-15T10:30:00Z',
    updatedAt: '2024-03-15T10:30:00Z',
  };

  const mockAuthService = {
    createUser: jest.fn(),
    validateUser: jest.fn(),
    findOrCreateOAuthUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'securePassword123',
        name: 'John Doe',
      };

      mockAuthService.createUser.mockResolvedValue(mockUser);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockUser);
      expect(mockAuthService.createUser).toHaveBeenCalledWith(registerDto);
    });

    it('should register a user without name', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'securePassword123',
      };

      const userWithoutName = { ...mockUser, name: null };
      mockAuthService.createUser.mockResolvedValue(userWithoutName);

      const result = await controller.register(registerDto);

      expect(result).toEqual(userWithoutName);
      expect(mockAuthService.createUser).toHaveBeenCalledWith(registerDto);
    });

    it('should throw HttpException when user already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'securePassword123',
        name: 'John Doe',
      };

      const prismaError = { code: 'P2002' };
      mockAuthService.createUser.mockRejectedValue(prismaError);

      await expect(controller.register(registerDto)).rejects.toThrow(
        new HttpException('User with this email already exists', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw HttpException for other registration errors', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'securePassword123',
        name: 'John Doe',
      };

      mockAuthService.createUser.mockRejectedValue(new Error('Database error'));

      await expect(controller.register(registerDto)).rejects.toThrow(
        new HttpException('Registration failed', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'securePassword123',
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockUser);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });

    it('should throw HttpException when user is not found', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'securePassword123',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should throw HttpException when password is invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should throw HttpException when service throws error', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'securePassword123',
      };

      mockAuthService.validateUser.mockRejectedValue(new Error('Database error'));

      await expect(controller.login(loginDto)).rejects.toThrow(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
      );
    });
  });

  describe('handleOAuth', () => {
    it('should successfully handle OAuth authentication', async () => {
      const oauthDto: OAuthDto = {
        email: 'oauth@example.com',
        name: 'OAuth User',
        image: 'https://example.com/avatar.jpg',
        provider: 'google',
        providerAccountId: '123456789',
      };

      const oauthUser = {
        ...mockUser,
        email: 'oauth@example.com',
        name: 'OAuth User',
        image: 'https://example.com/avatar.jpg',
      };

      mockAuthService.findOrCreateOAuthUser.mockResolvedValue(oauthUser);

      const result = await controller.handleOAuth(oauthDto);

      expect(result).toEqual(oauthUser);
      expect(mockAuthService.findOrCreateOAuthUser).toHaveBeenCalledWith(oauthDto);
    });

    it('should handle OAuth for existing user', async () => {
      const oauthDto: OAuthDto = {
        email: 'test@example.com',
        name: 'Updated Name',
        image: 'https://example.com/new-avatar.jpg',
        provider: 'github',
        providerAccountId: '987654321',
      };

      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
        image: 'https://example.com/new-avatar.jpg',
      };

      mockAuthService.findOrCreateOAuthUser.mockResolvedValue(updatedUser);

      const result = await controller.handleOAuth(oauthDto);

      expect(result).toEqual(updatedUser);
      expect(mockAuthService.findOrCreateOAuthUser).toHaveBeenCalledWith(oauthDto);
    });

    it('should handle OAuth without name and image', async () => {
      const oauthDto: OAuthDto = {
        email: 'minimal@example.com',
        provider: 'facebook',
        providerAccountId: '111222333',
      };

      const minimalUser = {
        ...mockUser,
        email: 'minimal@example.com',
        name: null,
        image: null,
      };

      mockAuthService.findOrCreateOAuthUser.mockResolvedValue(minimalUser);

      const result = await controller.handleOAuth(oauthDto);

      expect(result).toEqual(minimalUser);
      expect(mockAuthService.findOrCreateOAuthUser).toHaveBeenCalledWith(oauthDto);
    });

    it('should throw HttpException when OAuth authentication fails', async () => {
      const oauthDto: OAuthDto = {
        email: 'oauth@example.com',
        name: 'OAuth User',
        image: 'https://example.com/avatar.jpg',
        provider: 'google',
        providerAccountId: '123456789',
      };

      mockAuthService.findOrCreateOAuthUser.mockRejectedValue(new Error('Database error'));

      await expect(controller.handleOAuth(oauthDto)).rejects.toThrow(
        new HttpException('OAuth authentication failed', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });
}); 