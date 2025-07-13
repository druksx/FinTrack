import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
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
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto): Promise<SubscriptionDto> {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all subscriptions', description: 'Retrieve all active recurring subscriptions' })
  @ApiResponse({ status: 200, description: 'List of subscriptions', type: [SubscriptionDto] })
  async findAll(): Promise<SubscriptionDto[]> {
    return this.subscriptionsService.findAll();
  }

  @Get('month')
  @ApiOperation({ summary: 'Get subscriptions for month', description: 'Retrieve all subscriptions that will be billed in a specific month' })
  @ApiQuery({ name: 'year', description: 'Year (YYYY)', example: '2024' })
  @ApiQuery({ name: 'month', description: 'Month (1-12)', example: '3' })
  @ApiResponse({ status: 200, description: 'List of subscriptions for the month', type: [SubscriptionDto] })
  async findAllForMonth(
    @Query('year') year: string,
    @Query('month') month: string,
  ): Promise<SubscriptionDto[]> {
    return this.subscriptionsService.findAllForMonth(Number(year), Number(month));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update subscription', description: 'Update an existing subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully', type: SubscriptionDto })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateSubscriptionDto>,
  ): Promise<SubscriptionDto> {
    return this.subscriptionsService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subscription', description: 'Cancel and remove a recurring subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 204, description: 'Subscription deleted successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.subscriptionsService.delete(id);
  }
} 