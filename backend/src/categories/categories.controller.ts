import { Body, Controller, Get, Post, Delete, Param, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiNotFoundResponse, ApiConflictResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryDto } from './dto/category.dto';
import { Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class CategoryIdParam {
  @ApiProperty({
    description: 'Category ID in CUID format',
    example: 'c123abc456def',
    pattern: '^c[a-z0-9]+$'
  })
  @Matches(/^c[a-z0-9]+$/, {
    message: 'Category ID must be a valid CUID',
  })
  id: string;
}

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new category',
    description: 'Create a new expense category with a name, color, and icon'
  })
  @ApiCreatedResponse({
    description: 'Category created successfully',
    type: CategoryDto,
  })
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryDto> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all categories',
    description: 'Retrieve all available expense categories'
  })
  @ApiOkResponse({
    description: 'List of categories',
    type: [CategoryDto],
  })
  findAll(): Promise<CategoryDto[]> {
    return this.categoriesService.findAll();
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a category',
    description: 'Delete a category if it has no linked expenses'
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID in CUID format',
    example: 'c123abc456def'
  })
  @ApiOkResponse({
    description: 'Category deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  @ApiConflictResponse({
    description: 'Cannot delete category because it has linked expenses',
  })
  deleteOne(@Param() params: CategoryIdParam): Promise<void> {
    return this.categoriesService.deleteOne(params.id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a category',
    description: 'Update an existing category\'s name, color, or icon'
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID in CUID format',
    example: 'c123abc456def'
  })
  @ApiOkResponse({
    description: 'Category updated successfully',
    type: CategoryDto,
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  update(@Param() params: CategoryIdParam, @Body() updateCategoryDto: CreateCategoryDto): Promise<CategoryDto> {
    return this.categoriesService.update(params.id, updateCategoryDto);
  }
}
