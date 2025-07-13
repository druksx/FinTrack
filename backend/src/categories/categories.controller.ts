import { Body, Controller, Get, Post, Delete, Param, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiNotFoundResponse, ApiConflictResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryDto } from './dto/category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'Category created successfully',
    type: CategoryDto,
  })
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryDto> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOkResponse({
    description: 'List of categories',
    type: [CategoryDto],
  })
  findAll(): Promise<CategoryDto[]> {
    return this.categoriesService.findAll();
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Category deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  @ApiConflictResponse({
    description: 'Cannot delete category because it has linked expenses',
  })
  deleteOne(@Param('id') id: string): Promise<void> {
    return this.categoriesService.deleteOne(id);
  }

  @Put(':id')
  @ApiOkResponse({
    description: 'Category updated successfully',
    type: CategoryDto,
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  update(@Param('id') id: string, @Body() updateCategoryDto: CreateCategoryDto): Promise<CategoryDto> {
    return this.categoriesService.update(id, updateCategoryDto);
  }
}
