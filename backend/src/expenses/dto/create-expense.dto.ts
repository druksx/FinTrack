import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsDecimal, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateExpenseDto {
  @ApiProperty({
    example: 42.50,
    description: 'Expense amount in the default currency',
    minimum: 0.01,
  })
  @IsDecimal()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    example: '2024-03-15',
    description: 'Date of the expense',
    format: 'date',
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  date: Date;

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