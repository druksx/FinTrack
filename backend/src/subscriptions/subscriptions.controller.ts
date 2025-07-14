import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionDto } from './dto/subscription.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription', description: 'Create a new recurring subscription with monthly billing' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully', type: SubscriptionDto })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiHeader({ name: 'x-user-id', description: 'User ID', required: true })
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto, @Headers('x-user-id') userId: string): Promise<SubscriptionDto> {
    return this.subscriptionsService.create(createSubscriptionDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all subscriptions', description: 'Retrieve all active recurring subscriptions' })
  @ApiResponse({ status: 200, description: 'List of subscriptions', type: [SubscriptionDto] })
  @ApiHeader({ name: 'x-user-id', description: 'User ID', required: true })
  async findAll(@Headers('x-user-id') userId: string): Promise<SubscriptionDto[]> {
    return this.subscriptionsService.findAll(userId);
  }

  @Get('month')
  @ApiOperation({ summary: 'Get subscriptions for month', description: 'Retrieve all subscriptions that will be billed in a specific month' })
  @ApiQuery({ name: 'year', description: 'Year (YYYY)', example: '2024' })
  @ApiQuery({ name: 'month', description: 'Month (1-12)', example: '3' })
  @ApiResponse({ status: 200, description: 'List of subscriptions for the month', type: [SubscriptionDto] })
  @ApiHeader({ name: 'x-user-id', description: 'User ID', required: true })
  async findAllForMonth(
    @Query('year') year: string,
    @Query('month') month: string,
    @Headers('x-user-id') userId: string,
  ): Promise<SubscriptionDto[]> {
    return this.subscriptionsService.findAllForMonth(Number(year), Number(month), userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update subscription', description: 'Update an existing subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully', type: SubscriptionDto })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiHeader({ name: 'x-user-id', description: 'User ID', required: true })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateSubscriptionDto>,
    @Headers('x-user-id') userId: string,
  ): Promise<SubscriptionDto> {
    return this.subscriptionsService.update(id, updateData, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subscription', description: 'Cancel and remove a recurring subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 204, description: 'Subscription deleted successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiHeader({ name: 'x-user-id', description: 'User ID', required: true })
  async delete(@Param('id') id: string, @Headers('x-user-id') userId: string): Promise<void> {
    return this.subscriptionsService.delete(id, userId);
  }
} 