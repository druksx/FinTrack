import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseDto } from './dto/expense.dto';
import {
  DashboardDataDto,
  CategoryTotalDto,
  MonthComparisonDto,
} from './dto/dashboard.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(createExpenseDto: CreateExpenseDto, userId: string): Promise<ExpenseDto> {
    const expense = await this.prisma.expense.create({
      data: {
        amount: new Prisma.Decimal(createExpenseDto.amount),
        date: new Date(createExpenseDto.date),
        categoryId: createExpenseDto.categoryId,
        note: createExpenseDto.note,
        userId: userId,
      },
      include: {
        category: true,
      },
    });

    return this.mapToExpenseDto(expense);
  }

  async findAll(userId: string, month?: string): Promise<ExpenseDto[]> {
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
        userId: userId,
      },
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
    });

    return expenses.map(this.mapToExpenseDto);
  }

  async findAllForMonth(year: number, monthNum: number, userId: string): Promise<ExpenseDto[]> {
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    // Get all expenses for the month
    const expenses = await this.prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Map regular expenses to DTOs
    const expenseDtos = expenses.map(this.mapToExpenseDto);

    // Get all subscriptions that are due this month
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        OR: [
          // Monthly subscriptions
          {
            recurrence: 'MONTHLY',
            startDate: {
              lte: endDate, // Started before or during this month
            },
          },
          // Annual subscriptions
          {
            recurrence: 'ANNUALLY',
            startDate: {
              lte: endDate, // Started before or during this month
            },
          },
        ],
      },
      include: {
        category: true,
      },
    });

    // Process subscriptions to get the correct payment dates for this month
    const processedSubscriptions = subscriptions.map((sub) => {
      const subStartDate = new Date(sub.startDate);
      const subDayOfMonth = subStartDate.getDate();
      
      // Skip if the day doesn't exist in this month
      if (subDayOfMonth > endDate.getDate()) {
        return null;
      }

      if (sub.recurrence === 'ANNUALLY') {
        const subStartYear = subStartDate.getFullYear();
        const yearsToAdd = year - subStartYear;
        
        // Only include if it's the start year or a future year
        if (yearsToAdd >= 0) {
          // Calculate the actual payment date for this year
          const paymentDate = new Date(subStartDate);
          paymentDate.setFullYear(year);
          
          // Only include if the payment date falls in our target month
          if (paymentDate.getMonth() === monthNum - 1) {
            return {
              ...sub,
              nextPayment: paymentDate,
            };
          }
        }
        return null;
      } else {
        // For monthly subscriptions
        const paymentDate = new Date(year, monthNum - 1, subDayOfMonth);
        return {
          ...sub,
          nextPayment: paymentDate,
        };
      }
    }).filter(Boolean); // Remove null entries

    // Convert subscriptions to expense DTOs
    const subscriptionExpenses = processedSubscriptions
      .filter((subscription): subscription is NonNullable<typeof subscription> => subscription !== null)
      .map((subscription) => {
        const subscriptionDate = new Date(subscription.startDate);
        const paymentDay = subscriptionDate.getDate();
        return {
          id: `subscription_${subscription.id}_${year}_${monthNum}`,
          amount: subscription.amount.toString(),
          date: new Date(year, monthNum - 1, paymentDay).toISOString().split('T')[0],
          note: subscription.name,
          categoryId: subscription.categoryId,
          category: {
            id: subscription.category.id,
            name: subscription.category.name,
            color: subscription.category.color,
            icon: subscription.category.icon,
          },
          isSubscription: true,
          subscription: {
            id: subscription.id,
            name: subscription.name,
            amount: subscription.amount.toString(),
            recurrence: subscription.recurrence,
            logoUrl: subscription.logoUrl,
          },
          createdAt: subscription.createdAt.toISOString(),
          updatedAt: subscription.updatedAt.toISOString(),
        };
      }) as ExpenseDto[];

    // Combine and sort all expenses
    const allExpenses = [...expenseDtos, ...subscriptionExpenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return allExpenses;
  }

  async findAllForYear(year: number, userId: string): Promise<ExpenseDto[]> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Get all expenses for the year
    const expenses = await this.prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Map regular expenses to DTOs
    const expenseDtos = expenses.map(this.mapToExpenseDto);

    // Get all subscriptions that are due this year
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        OR: [
          // Monthly subscriptions
          {
            recurrence: 'MONTHLY',
            startDate: {
              lte: endDate, // Started before or during this year
            },
          },
          // Annual subscriptions
          {
            recurrence: 'ANNUALLY',
            startDate: {
              lte: endDate, // Started before or during this year
            },
          },
        ],
      },
      include: {
        category: true,
      },
    });

    // Process subscriptions to get all payment dates for this year
    const subscriptionExpenses = subscriptions.flatMap((subscription) => {
      const subscriptionDate = new Date(subscription.startDate);
      const paymentDay = subscriptionDate.getDate();

      if (subscription.recurrence === 'MONTHLY') {
        // For monthly subscriptions, create an expense for each month
        return Array.from({ length: 12 }, (_, monthIndex) => {
          // Skip if the payment day doesn't exist in this month
          const lastDayOfMonth = new Date(year, monthIndex + 1, 0).getDate();
          if (paymentDay > lastDayOfMonth) {
            return null;
          }

          return {
            id: `subscription_${subscription.id}_${year}_${monthIndex + 1}`,
            amount: subscription.amount.toString(),
            date: new Date(year, monthIndex, paymentDay).toISOString().split('T')[0],
            note: subscription.name,
            categoryId: subscription.categoryId,
            category: {
              id: subscription.category.id,
              name: subscription.category.name,
              color: subscription.category.color,
              icon: subscription.category.icon,
            },
            isSubscription: true,
            subscription: {
              id: subscription.id,
              name: subscription.name,
              amount: subscription.amount.toString(),
              recurrence: subscription.recurrence,
              logoUrl: subscription.logoUrl,
            },
            createdAt: subscription.createdAt.toISOString(),
            updatedAt: subscription.updatedAt.toISOString(),
          } as ExpenseDto;
        }).filter((expense): expense is ExpenseDto => expense !== null);
      } else {
        // For annual subscriptions
        const subscriptionYear = subscriptionDate.getFullYear();
        if (year < subscriptionYear) {
          return [];
        }

        // Create a single expense for the year
        return [{
          id: `subscription_${subscription.id}_${year}`,
          amount: subscription.amount.toString(),
          date: new Date(year, subscriptionDate.getMonth(), paymentDay).toISOString().split('T')[0],
          note: subscription.name,
          categoryId: subscription.categoryId,
          category: {
            id: subscription.category.id,
            name: subscription.category.name,
            color: subscription.category.color,
            icon: subscription.category.icon,
          },
          isSubscription: true,
          subscription: {
            id: subscription.id,
            name: subscription.name,
            amount: subscription.amount.toString(),
            recurrence: subscription.recurrence,
            logoUrl: subscription.logoUrl,
          },
          createdAt: subscription.createdAt.toISOString(),
          updatedAt: subscription.updatedAt.toISOString(),
        } as ExpenseDto];
      }
    });

    // Combine and sort all expenses
    const allExpenses = [...expenseDtos, ...subscriptionExpenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return allExpenses;
  }

  async update(
    id: string,
    updateExpenseDto: CreateExpenseDto,
    userId: string,
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

  async delete(id: string, userId: string): Promise<void> {
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

  async getDashboardData(userId: string, month?: string): Promise<DashboardDataDto> {
    const [year, monthNum] = month
      ? month.split('-').map(Number)
      : [new Date().getFullYear(), new Date().getMonth() + 1];

    // Calculate date ranges
    const currentMonthStart = new Date(year, monthNum - 1, 1);
    const currentMonthEnd = new Date(year, monthNum, 0);
    const previousMonthStart = new Date(year, monthNum - 2, 1);
    const previousMonthEnd = new Date(year, monthNum - 1, 0);

    // Get current month subscriptions
    const currentMonthSubscriptions = await this.prisma.subscription.findMany({
      where: {
        OR: [
          // Monthly subscriptions due this month
          {
            recurrence: 'MONTHLY',
            startDate: {
              lte: currentMonthEnd,
            },
          },
          // Annual subscriptions due this month
          {
            recurrence: 'ANNUALLY',
            nextPayment: {
              gte: currentMonthStart,
              lte: currentMonthEnd,
            },
          },
        ],
      },
    });

    // Get previous month subscriptions
    const previousMonthSubscriptions = await this.prisma.subscription.findMany({
      where: {
        OR: [
          // Monthly subscriptions due previous month
          {
            recurrence: 'MONTHLY',
            startDate: {
              lte: previousMonthEnd,
            },
          },
          // Annual subscriptions due previous month
          {
            recurrence: 'ANNUALLY',
            nextPayment: {
              gte: previousMonthStart,
              lte: previousMonthEnd,
            },
          },
        ],
      },
    });

    // Calculate subscription totals
    const currentMonthSubscriptionTotal = currentMonthSubscriptions.reduce(
      (sum, sub) => sum.add(sub.amount),
      new Prisma.Decimal(0)
    );

    const previousMonthSubscriptionTotal = previousMonthSubscriptions.reduce(
      (sum, sub) => sum.add(sub.amount),
      new Prisma.Decimal(0)
    );

    // Get current month manual expenses total
    const currentMonthExpenses = await this.prisma.expense.aggregate({
      where: {
        userId: userId,
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get previous month manual expenses total
    const previousMonthExpenses = await this.prisma.expense.aggregate({
      where: {
        userId: userId,
        date: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Combine manual expenses and subscription totals
    const currentTotal = (currentMonthExpenses._sum.amount || new Prisma.Decimal(0))
      .add(currentMonthSubscriptionTotal);
    const previousTotal = (previousMonthExpenses._sum.amount || new Prisma.Decimal(0))
      .add(previousMonthSubscriptionTotal);

    // Get category totals for current month (including subscriptions)
    const manualExpenseCategoryTotals = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId: userId,
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Group subscription amounts by category
    const subscriptionCategoryTotals = new Map<string, Prisma.Decimal>();
    for (const sub of currentMonthSubscriptions) {
      const current = subscriptionCategoryTotals.get(sub.categoryId) || new Prisma.Decimal(0);
      subscriptionCategoryTotals.set(sub.categoryId, current.add(sub.amount));
    }

    // Combine manual and subscription category totals
    const combinedCategoryTotals = [...manualExpenseCategoryTotals];
    for (const [categoryId, amount] of subscriptionCategoryTotals.entries()) {
      const existingIndex = combinedCategoryTotals.findIndex(ct => ct.categoryId === categoryId);
      if (existingIndex >= 0) {
        combinedCategoryTotals[existingIndex]._sum.amount = 
          combinedCategoryTotals[existingIndex]._sum.amount!.add(amount);
      } else {
        combinedCategoryTotals.push({
          categoryId,
          _sum: { amount }
        });
      }
    }

    // Get category details
    const categories = await this.prisma.category.findMany({
      where: {
        id: {
          in: combinedCategoryTotals.map((ct) => ct.categoryId),
        },
      },
    });

    // Calculate total expenses and category percentages
    const totalExpenses = currentTotal;
    const topCategories: CategoryTotalDto[] = combinedCategoryTotals
      .map((ct) => {
        const category = categories.find((c) => c.id === ct.categoryId);
        const amount = ct._sum.amount;
        if (!category || !amount) return null;
        return {
          id: category.id,
          name: category.name,
          color: category.color,
          icon: category.icon,
          total: amount.toString(),
          percentage: Number(amount.div(totalExpenses).mul(100).toFixed(1)),
        };
      })
      .filter((ct): ct is CategoryTotalDto => ct !== null)
      .sort((a, b) => Number(b.total) - Number(a.total))
      .slice(0, 5); // Get top 5 categories

    // Calculate month-over-month comparison
    const percentageChange = previousTotal.equals(0)
      ? 0
      : Number(
          currentTotal
            .minus(previousTotal)
            .div(previousTotal)
            .mul(100)
            .toFixed(1),
        );

    // Get daily expenses
    const dailyExpenses = await this.prisma.expense.groupBy({
      by: ['date'],
      where: {
        userId: userId,
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get weekday averages
    const weekdayExpenses = await this.prisma.expense.groupBy({
      by: ['date'],
      where: {
        userId: userId,
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Process daily expenses
    const dailyExpensesData = dailyExpenses.map(day => ({
      date: day.date.toISOString().split('T')[0],
      total: day._sum.amount?.toString() || '0',
    }));

    // Calculate weekday averages
    const weekdayTotals = new Map<number, { total: Prisma.Decimal; count: number }>();
    weekdayExpenses.forEach(day => {
      const weekday = day.date.getDay();
      const amount = day._sum.amount || new Prisma.Decimal(0);
      const current = weekdayTotals.get(weekday) || { total: new Prisma.Decimal(0), count: 0 };
      weekdayTotals.set(weekday, {
        total: current.total.add(amount),
        count: current.count + 1,
      });
    });

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekdayAveragesData = weekdays.map((day, index) => {
      const data = weekdayTotals.get(index) || { total: new Prisma.Decimal(0), count: 1 };
      return {
        day,
        average: data.total.div(data.count).toString(),
      };
    });

    return {
      totalExpenses: totalExpenses.toString(),
      topCategories,
      monthComparison: {
        currentMonth: currentTotal.toString(),
        previousMonth: previousTotal.toString(),
        percentageChange,
      },
      charts: {
        dailyExpenses: dailyExpensesData,
        weekdayAverages: weekdayAveragesData,
      },
    };
  }

  async getExpensesForExport(userId: string, month: string): Promise<any> {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    // Get manual expenses
    const expenses = await this.prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Get subscriptions for the month
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        OR: [
          // Monthly subscriptions
          {
            recurrence: 'MONTHLY',
            startDate: {
              lte: endDate,
            },
          },
          // Annual subscriptions due this month
          {
            recurrence: 'ANNUALLY',
            nextPayment: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
      include: {
        category: true,
      },
    });

    // Convert expenses to export format
    const expenseRows = expenses.map(expense => ({
      date: expense.date.toISOString().split('T')[0],
      amount: Number(expense.amount).toFixed(2),
      category: expense.category.name,
      note: expense.note,
      type: 'Manual Expense'
    }));

    // Convert subscriptions to export format
    const subscriptionRows = subscriptions.map(subscription => ({
      date: new Date(year, monthNum - 1, subscription.startDate.getDate()).toISOString().split('T')[0],
      amount: Number(subscription.amount).toFixed(2),
      category: subscription.category.name,
      note: `${subscription.name} (${subscription.recurrence.toLowerCase()} subscription)`,
      type: 'Subscription'
    }));

    // Combine and sort all entries by date
    return [...expenseRows, ...subscriptionRows].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
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
