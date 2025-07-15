import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, OAuthDto, RegisterDto, UserResponseDto } from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account with email and password. The user will be automatically logged in upon successful registration.'
  })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration data',
    examples: {
      'with name': {
        value: {
          email: 'user@example.com',
          password: 'securePassword123',
          name: 'John Doe'
        }
      },
      'without name': {
        value: {
          email: 'user@example.com',
          password: 'securePassword123'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered and logged in',
    type: UserResponseDto,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      name: 'John Doe',
      image: null,
      createdAt: '2024-03-15T10:30:00Z',
      updatedAt: '2024-03-15T10:30:00Z'
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - User already exists or invalid data',
    example: {
      statusCode: 400,
      message: 'User with this email already exists'
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Registration failed',
    example: {
      statusCode: 500,
      message: 'Registration failed'
    }
  })
  async register(@Body() registerDto: RegisterDto): Promise<UserResponseDto> {
    try {
      const user = await this.authService.createUser(registerDto);
      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new HttpException('User with this email already exists', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Registration failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticate user with email and password credentials. Returns user data if authentication is successful.'
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
    examples: {
      'login example': {
        value: {
          email: 'user@example.com',
          password: 'securePassword123'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated',
    type: UserResponseDto,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      name: 'John Doe',
      image: null,
      createdAt: '2024-03-15T10:30:00Z',
      updatedAt: '2024-03-15T10:30:00Z'
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
    example: {
      statusCode: 401,
      message: 'Invalid credentials'
    }
  })
  async login(@Body() loginDto: LoginDto): Promise<UserResponseDto> {
    try {
      const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
      );
      if (!user) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }
      return user;
    } catch (error) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('oauth')
  @ApiOperation({
    summary: 'OAuth authentication',
    description: 'Handle OAuth authentication from external providers (Google, GitHub, Facebook). Creates a new user if they don\'t exist, or returns existing user data.'
  })
  @ApiBody({
    type: OAuthDto,
    description: 'OAuth provider data',
    examples: {
      'google oauth': {
        value: {
          email: 'user@gmail.com',
          name: 'John Doe',
          image: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
          provider: 'google',
          providerAccountId: '123456789'
        }
      },
      'github oauth': {
        value: {
          email: 'user@github.com',
          name: 'John Doe',
          image: 'https://avatars.githubusercontent.com/u/123456789?v=4',
          provider: 'github',
          providerAccountId: '123456789'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'OAuth authentication successful',
    type: UserResponseDto,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@gmail.com',
      name: 'John Doe',
      image: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      createdAt: '2024-03-15T10:30:00Z',
      updatedAt: '2024-03-15T10:30:00Z'
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - OAuth authentication failed',
    example: {
      statusCode: 500,
      message: 'OAuth authentication failed'
    }
  })
  async handleOAuth(@Body() oauthDto: OAuthDto): Promise<UserResponseDto> {
    try {
      const user = await this.authService.findOrCreateOAuthUser(oauthDto);
      return user;
    } catch (error) {
      throw new HttpException(
        'OAuth authentication failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
 