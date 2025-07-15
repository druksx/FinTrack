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

    if (recurrence === 'ANNUALLY') {
      const nextPayment = new Date(startDate);

      if (nextPayment < now) {
        const startYear = startDate.getFullYear();
        const currentYear = now.getFullYear();
        const yearsToAdd = currentYear - startYear + 1;
        nextPayment.setFullYear(startYear + yearsToAdd);

        if (nextPayment < now) {
          nextPayment.setFullYear(nextPayment.getFullYear() + 1);
        }
      }

      return nextPayment;
    } else {
      const dayOfMonth = startDate.getDate();
      const nextPayment = new Date(
        now.getFullYear(),
        now.getMonth(),
        dayOfMonth,
      );

      if (nextPayment < now) {
        nextPayment.setMonth(now.getMonth() + 1);
      }

      return nextPayment;
    }
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
    userId: string,
  ): Promise<SubscriptionDto> {
    const startDate = new Date(
      `${createSubscriptionDto.startDate}T00:00:00.000Z`,
    );

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
        userId,
      },
      include: {
        category: true,
      },
    });

    return this.mapToSubscriptionDto(subscription);
  }

  async findAll(userId: string): Promise<SubscriptionDto[]> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
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
    userId: string,
  ): Promise<SubscriptionDto[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        userId,
        OR: [
          {
            recurrence: 'MONTHLY',
            startDate: {
              lte: endDate,
            },
          },
          {
            recurrence: 'ANNUALLY',
            startDate: {
              lte: endDate,
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

    const processedSubscriptions = subscriptions
      .map((sub) => {
        const subStartDate = new Date(sub.startDate);
        const subDayOfMonth = subStartDate.getDate();

        if (subDayOfMonth > endDate.getDate()) {
          return null;
        }

        if (sub.recurrence === 'ANNUALLY') {
          const subStartYear = subStartDate.getFullYear();
          const yearsToAdd = year - subStartYear;

          if (yearsToAdd >= 0) {
            const paymentDate = new Date(subStartDate);
            paymentDate.setFullYear(year);

            if (paymentDate.getMonth() === month - 1) {
              return {
                ...sub,
                nextPayment: paymentDate,
              };
            }
          }
          return null;
        } else {
          const paymentDate = new Date(year, month - 1, subDayOfMonth);
          return {
            ...sub,
            nextPayment: paymentDate,
          };
        }
      })
      .filter(Boolean);

    return processedSubscriptions.map(this.mapToSubscriptionDto);
  }

  async update(
    id: string,
    updateData: Partial<CreateSubscriptionDto>,
    userId: string,
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
        amount:
          updateData.amount !== undefined
            ? new Prisma.Decimal(updateData.amount)
            : undefined,
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

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.subscription.delete({
      where: { id },
    });
  }
}
