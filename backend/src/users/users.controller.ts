import {
  Controller,
  Get,
  Put,
  Body,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, ChangePasswordDto, UserDto } from './dto/user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiHeader({ name: 'x-user-id', description: 'User ID', required: true })
  async getProfile(@Headers('x-user-id') userId: string): Promise<UserDto> {
    return this.usersService.getProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiHeader({ name: 'x-user-id', description: 'User ID', required: true })
  async updateProfile(
    @Headers('x-user-id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserDto> {
    try {
      return await this.usersService.updateProfile(userId, updateProfileDto);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        'Failed to update profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiHeader({ name: 'x-user-id', description: 'User ID', required: true })
  async changePassword(
    @Headers('x-user-id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    try {
      await this.usersService.changePassword(userId, changePasswordDto);
      return { message: 'Password changed successfully' };
    } catch (error) {
      if (error.message === 'Invalid current password') {
        throw new HttpException(
          'Invalid current password',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Failed to change password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
