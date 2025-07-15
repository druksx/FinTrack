import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionDto {
  @ApiProperty({
    description: 'Unique identifier for the subscription',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the subscription service',
    example: 'Netflix',
  })
  name: string;

  @ApiProperty({
    description: 'Monthly billing amount',
    example: 15.99,
  })
  amount: string;

  @ApiProperty({
    description: 'URL to the subscription service logo',
    example: 'https://example.com/netflix-logo.png',
    required: false,
  })
  logoUrl?: string;

  @ApiProperty({
    description: 'Billing frequency',
    enum: ['MONTHLY', 'ANNUALLY'],
    example: 'MONTHLY',
  })
  recurrence: 'MONTHLY' | 'ANNUALLY';

  @ApiProperty({
    description: 'Date when the subscription starts',
    example: '2024-03-15',
  })
  startDate: string;

  @ApiProperty({
    description: 'Date of the next payment',
    example: '2024-04-15',
  })
  nextPayment: string;

  @ApiProperty({
    description: 'Category ID for expense categorization',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Category details',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Entertainment',
      color: '#FF5733',
      icon: 'movie',
    },
  })
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };

  @ApiProperty({
    description: 'Timestamp when the subscription was created',
    example: '2024-03-15T10:30:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Timestamp when the subscription was last updated',
    example: '2024-03-15T10:30:00Z',
  })
  updatedAt: string;
}
