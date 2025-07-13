import { IsString, IsOptional, IsIn, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Name of the subscription service',
    example: 'Netflix',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Monthly billing amount',
    example: 15.99,
    minimum: 0.01
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'URL to the subscription service logo',
    example: 'https://example.com/netflix-logo.png',
    required: false
  })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({
    description: 'Billing frequency',
    enum: ['MONTHLY', 'ANNUALLY'],
    example: 'MONTHLY'
  })
  @IsString()
  @IsIn(['MONTHLY', 'ANNUALLY'])
  recurrence: 'MONTHLY' | 'ANNUALLY';

  @ApiProperty({
    description: 'Date when the subscription starts',
    example: '2024-03-15'
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Category to assign expenses to when generated',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  categoryId: string;
} 