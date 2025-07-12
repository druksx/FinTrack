import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsString, IsOptional, IsUUID, Matches } from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({
    example: '42.50',
    description: 'Expense amount in the default currency',
    minimum: 0.01,
  })
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'Amount must be a valid decimal number with up to 2 decimal places',
  })
  amount: string;

  @ApiProperty({
    example: '2024-03-15',
    description: 'Date of the expense',
    format: 'date',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the category this expense belongs to',
    format: 'uuid',
  })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({
    example: 'Weekly groceries',
    description: 'Optional note about the expense',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  note?: string;
} 