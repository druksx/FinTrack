import { IsHexColor, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Groceries',
    description: 'The name of the category',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: '#65CE55',
    description: 'Hex color code for the category',
    pattern: '^#[0-9A-Fa-f]{6}$',
  })
  @IsString()
  @IsHexColor()
  color: string;
}
