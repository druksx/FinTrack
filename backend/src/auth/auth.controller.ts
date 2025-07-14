import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, OAuthDto, RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
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
  async login(@Body() loginDto: LoginDto) {
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
  async handleOAuth(@Body() oauthDto: OAuthDto) {
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
 