import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsString, IsOptional, Matches } from 'class-validator';

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
    example: 'cmd1sifx80000g089rt641l1s',
    description: 'The ID of the category this expense belongs to',
    format: 'cuid',
  })
  @IsString()
  @Matches(/^c[a-z0-9]+$/, {
    message: 'Category ID must be a valid CUID',
  })
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