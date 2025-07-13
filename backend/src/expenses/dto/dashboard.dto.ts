import { ApiProperty } from '@nestjs/swagger';

export class CategoryTotalDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the category',
  })
  id: string;

  @ApiProperty({
    example: 'Groceries',
    description: 'The name of the category',
  })
  name: string;

  @ApiProperty({
    example: '#65CE55',
    description: 'Hex color code for the category',
  })
  color: string;

  @ApiProperty({
    example: 'ShoppingCart',
    description: 'Lucide icon name for the category',
  })
  icon: string;

  @ApiProperty({
    example: '150.75',
    description: 'Total amount spent in this category',
  })
  total: string;

  @ApiProperty({
    example: '25.5',
    description: 'Percentage of total expenses this category represents',
  })
  percentage: number;
}

export class MonthComparisonDto {
  @ApiProperty({
    example: '590.25',
    description: 'Total expenses for the current month',
  })
  currentMonth: string;

  @ApiProperty({
    example: '450.75',
    description: 'Total expenses for the previous month',
  })
  previousMonth: string;

  @ApiProperty({
    example: '31.25',
    description: 'Percentage change from previous month',
  })
  percentageChange: number;
}

export class DailyExpenseDto {
  @ApiProperty({
    example: '2024-03-15',
    description: 'The date of the expenses',
  })
  date: string;

  @ApiProperty({
    example: '42.50',
    description: 'Total amount spent on this date',
  })
  total: string;
}

export class WeekdayExpenseDto {
  @ApiProperty({
    example: 'Monday',
    description: 'Day of the week',
  })
  day: string;

  @ApiProperty({
    example: '150.75',
    description: 'Average amount spent on this day of the week',
  })
  average: string;
}

export class DashboardChartsDto {
  @ApiProperty({
    description: 'Daily expenses for the current month',
    type: [DailyExpenseDto],
  })
  dailyExpenses: DailyExpenseDto[];

  @ApiProperty({
    description: 'Average spending by day of the week',
    type: [WeekdayExpenseDto],
  })
  weekdayAverages: WeekdayExpenseDto[];
}

export class DashboardDataDto {
  @ApiProperty({
    example: '590.25',
    description: 'Total expenses for the selected month',
  })
  totalExpenses: string;

  @ApiProperty({
    description: 'Top spending categories with their totals',
    type: [CategoryTotalDto],
  })
  topCategories: CategoryTotalDto[];

  @ApiProperty({
    description: 'Month-over-month comparison data',
    type: MonthComparisonDto,
  })
  monthComparison: MonthComparisonDto;

  @ApiProperty({
    description: 'Chart data for various visualizations',
    type: DashboardChartsDto,
  })
  charts: DashboardChartsDto;
}
 