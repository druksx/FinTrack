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

  @ApiProperty({
    example: '2024-03-20T12:00:00Z',
    description: 'When the category was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-03-20T12:00:00Z',
    description: 'When the category was last updated',
  })
  updatedAt: Date;
} 