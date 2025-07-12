import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the category',
    format: 'uuid',
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
    pattern: '^#[0-9A-Fa-f]{6}$',
  })
  color: string;
} 