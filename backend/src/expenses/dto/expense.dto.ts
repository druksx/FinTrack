import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryDto } from '../../categories/dto/category.dto';

export class ExpenseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the expense',
    format: 'uuid',
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
    format: 'uuid',
  })
  categoryId: string;

  @ApiPropertyOptional({
    example: 'Weekly groceries',
    description: 'Optional note about the expense',
  })
  note?: string;

  @ApiProperty({
    description: 'The category this expense belongs to',
    type: () => CategoryDto,
  })
  category: CategoryDto;

  @ApiProperty({
    example: '2024-03-15T12:00:00Z',
    description: 'When this expense was created',
    format: 'date-time',
  })
  createdAt: string;
} 