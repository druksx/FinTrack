import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionDto } from './dto/subscription.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  private calculateNextPayment(
    startDate: Date,
    recurrence: 'MONTHLY' | 'ANNUALLY',
  ): Date {
    const now = new Date();
    const dayOfMonth = startDate.getDate();
    const nextPayment = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);

    if (recurrence === 'ANNUALLY') {
      // If it's annual and this year's date has passed, move to next year
      if (nextPayment < now) {
        nextPayment.setFullYear(now.getFullYear() + 1);
      }
    } else {
      // If it's monthly and this month's date has passed, move to next month
      if (nextPayment < now) {
        nextPayment.setMonth(now.getMonth() + 1);
      }
    }

    return nextPayment;
  }

  private mapToSubscriptionDto(subscription: any): SubscriptionDto {
    return {
      ...subscription,
      amount: subscription.amount.toString(),
      startDate: subscription.startDate.toISOString(),
      nextPayment: subscription.nextPayment.toISOString(),
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString(),
    };
  }

  async create(
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<SubscriptionDto> {
    // Convert date string to ISO format
    const startDate = new Date(
      `${createSubscriptionDto.startDate}T00:00:00.000Z`,
    );

    // Calculate next payment using the start date
    const nextPayment = this.calculateNextPayment(
      startDate,
      createSubscriptionDto.recurrence,
    );

    const subscription = await this.prisma.subscription.create({
      data: {
        name: createSubscriptionDto.name,
        amount: new Prisma.Decimal(createSubscriptionDto.amount),
        logoUrl: createSubscriptionDto.logoUrl,
        recurrence: createSubscriptionDto.recurrence,
        startDate,
        nextPayment,
        categoryId: createSubscriptionDto.categoryId,
      },
      include: {
        category: true,
      },
    });

    return this.mapToSubscriptionDto(subscription);
  }

  async findAll(): Promise<SubscriptionDto[]> {
    const subscriptions = await this.prisma.subscription.findMany({
      include: {
        category: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return subscriptions.map(this.mapToSubscriptionDto);
  }

  async findAllForMonth(
    year: number,
    month: number,
  ): Promise<SubscriptionDto[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

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
      orderBy: {
        startDate: 'asc',
      },
    });

    // Post-process to ensure correct next payment dates and filter subscriptions
    const processedSubscriptions = subscriptions
      .map((sub) => {
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
            if (paymentDate.getMonth() === month - 1) {
              return {
                ...sub,
                nextPayment: paymentDate,
              };
            }
          }
          return null;
        } else {
          // For monthly subscriptions
          const paymentDate = new Date(year, month - 1, subDayOfMonth);
          return {
            ...sub,
            nextPayment: paymentDate,
          };
        }
      })
      .filter(Boolean); // Remove null entries

    return processedSubscriptions.map(this.mapToSubscriptionDto);
  }

  async update(
    id: string,
    updateData: Partial<CreateSubscriptionDto>,
  ): Promise<SubscriptionDto> {
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { id },
    });
    if (!existingSubscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    const startDate = updateData.startDate
      ? new Date(`${updateData.startDate}T00:00:00.000Z`)
      : existingSubscription.startDate;

    const subscription = await this.prisma.subscription.update({
      where: { id },
      data: {
        name: updateData.name,
        amount: updateData.amount !== undefined ? new Prisma.Decimal(updateData.amount) : undefined,
        logoUrl: updateData.logoUrl,
        recurrence: updateData.recurrence,
        startDate: updateData.startDate ? startDate : undefined,
        categoryId: updateData.categoryId,
        nextPayment: this.calculateNextPayment(
          startDate,
          (updateData.recurrence || existingSubscription.recurrence) as
            | 'MONTHLY'
            | 'ANNUALLY',
        ),
      },
      include: {
        category: true,
      },
    });

    return this.mapToSubscriptionDto(subscription);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.subscription.delete({
      where: { id },
    });
  }
}
