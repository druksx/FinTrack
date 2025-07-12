import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryDto> {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll(): Promise<CategoryDto[]> {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
