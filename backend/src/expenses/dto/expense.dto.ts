import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the category',
  })
  id: string;

  @ApiProperty({
    example: 'Groceries',
    description: 'The name of the category',
  })
  name: string;

  @ApiProperty({
    example: '#65CE55',
    description: 'Hex color code for the category',
  })
  color: string;

  @ApiProperty({
    example: 'ShoppingCart',
    description: 'Lucide icon name for the category',
  })
  icon: string;
}

export class ExpenseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the expense',
  })
  id: string;

  @ApiProperty({
    example: '42.50',
    description: 'Expense amount in the default currency',
  })
  amount: string;

  @ApiProperty({
    example: '2024-03-15',
    description: 'Date of the expense',
    format: 'date',
  })
  date: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the category this expense belongs to',
  })
  categoryId: string;

  @ApiProperty({
    example: 'Weekly groceries',
    description: 'Optional note about the expense',
  })
  note?: string;

  @ApiProperty({
    description: 'The category this expense belongs to',
    type: CategoryDto,
  })
  category: CategoryDto;

  @ApiProperty({
    example: '2024-03-15T12:00:00Z',
    description: 'When the expense was created',
  })
  createdAt: string;
}
