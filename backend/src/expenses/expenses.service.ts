import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseDto } from './dto/expense.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExpensesService {
  // Temporary user ID until we implement authentication
  private readonly DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

  constructor(private prisma: PrismaService) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<ExpenseDto> {
    const expense = await this.prisma.expense.create({
      data: {
        amount: new Prisma.Decimal(createExpenseDto.amount),
        date: new Date(createExpenseDto.date),
        categoryId: createExpenseDto.categoryId,
        note: createExpenseDto.note,
        userId: this.DEFAULT_USER_ID,
      },
      include: {
        category: true,
      },
    });

    return this.mapToExpenseDto(expense);
  }

  async findAll(month?: string): Promise<ExpenseDto[]> {
    let dateFilter = {};

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0);

      dateFilter = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const expenses = await this.prisma.expense.findMany({
      where: {
        ...dateFilter,
        userId: this.DEFAULT_USER_ID,
      },
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
    });

    return expenses.map(this.mapToExpenseDto);
  }

  async update(
    id: string,
    updateExpenseDto: CreateExpenseDto,
  ): Promise<ExpenseDto> {
    try {
      const expense = await this.prisma.expense.update({
        where: { id },
        data: {
          amount: new Prisma.Decimal(updateExpenseDto.amount),
          date: new Date(updateExpenseDto.date),
          categoryId: updateExpenseDto.categoryId,
          note: updateExpenseDto.note,
        },
        include: {
          category: true,
        },
      });

      return this.mapToExpenseDto(expense);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Expense with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.expense.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Expense with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  private mapToExpenseDto(expense: any): ExpenseDto {
    return {
      id: expense.id,
      amount: expense.amount.toString(),
      date: expense.date.toISOString().split('T')[0],
      categoryId: expense.categoryId,
      note: expense.note,
      category: {
        id: expense.category.id,
        name: expense.category.name,
        color: expense.category.color,
        icon: expense.category.icon,
      },
      createdAt: expense.createdAt.toISOString(),
    };
  }
}
