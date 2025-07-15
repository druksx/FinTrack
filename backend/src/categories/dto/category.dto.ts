import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty({
    example: 'cmd1sifx80000g089rt641l1s',
    description: 'Unique identifier for the category (CUID format)',
    pattern: '^c[a-z0-9]+$'
  })
  id: string;

  @ApiProperty({
    example: 'Groceries',
    description: 'Display name for the category',
    minLength: 1,
    maxLength: 50
  })
  name: string;

  @ApiProperty({
    example: '#65CE55',
    description: 'Hex color code for visual representation',
    pattern: '^#[0-9A-Fa-f]{6}$'
  })
  color: string;

  @ApiProperty({
    example: 'ShoppingCart',
    description: 'Icon name from Lucide icon set for visual representation',
    minLength: 1,
    maxLength: 50
  })
  icon: string;

  @ApiProperty({
    example: '2024-03-20T12:00:00.000Z',
    description: 'Timestamp when the category was created'
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-03-20T12:00:00.000Z',
    description: 'Timestamp when the category was last updated'
  })
  updatedAt: Date;
}