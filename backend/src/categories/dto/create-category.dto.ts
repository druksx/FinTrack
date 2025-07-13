import { IsHexColor, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Groceries',
    description: 'Display name for the category',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: '#65CE55',
    description: 'Hex color code for visual representation',
    pattern: '^#[0-9A-Fa-f]{6}$',
  })
  @IsString()
  @IsHexColor()
  color: string;

  @ApiProperty({
    example: 'ShoppingCart',
    description: 'Icon name from Lucide icon set for visual representation',
    minLength: 1,
    maxLength: 50
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  icon: string;
}
