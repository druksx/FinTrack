import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
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
}
