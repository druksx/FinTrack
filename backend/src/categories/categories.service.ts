import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryDto } from './dto/category.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string): Promise<CategoryDto> {
    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        userId,
      },
    });
  }

  async findAll(userId: string): Promise<CategoryDto[]> {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async deleteOne(id: string, userId: string): Promise<void> {
    try {
      // First check if the category exists and belongs to the user
      const category = await this.prisma.category.findFirst({
        where: { id, userId },
        include: { expenses: { take: 1 } }, // Only need to check if any exist
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      if (category.expenses.length > 0) {
        throw new ConflictException(
          'Cannot delete category because it has linked expenses. Please delete the expenses first.'
        );
      }

      // If we get here, we can safely delete the category
      await this.prisma.category.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Category with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async update(id: string, updateCategoryDto: CreateCategoryDto, userId: string): Promise<CategoryDto> {
    try {
      return await this.prisma.category.update({
        where: { id, userId },
        data: updateCategoryDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Category with ID ${id} not found`);
        }
      }
      throw error;
    }
  }
}
