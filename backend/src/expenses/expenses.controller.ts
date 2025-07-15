import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Param,
  Headers,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseDto } from './dto/expense.dto';
import { DashboardDataDto } from './dto/dashboard.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiNotFoundResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

class GetExpensesQuery {
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'month must be in YYYY-MM format (e.g. 2024-03)',
  })
  month?: string;
}

@ApiTags('expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({ status: 201, type: ExpenseDto })
  @ApiHeader({ name: 'x-user-id', description: 'User ID', required: true })
  create(
    @Body() createExpenseDto: CreateExpenseDto,
    @Headers('x-user-id') userId: string,
  ): Promise<ExpenseDto> {
    return this.expensesService.create(createExpenseDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses for a specific month' })
  @ApiResponse({ status: 200, type: [ExpenseDto] })
  @ApiHeader({ name: 'x-user-id', description: 'User ID', required: true })
  findAll(
    @Query() query: GetExpensesQuery,
    @Headers('x-user-id') userId: string,
  ): Promise<ExpenseDto[]> {
    return this.expensesService.findAll(userId, query.month);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an expense' })
  @ApiResponse({ status: 200, type: ExpenseDto })
  @ApiNotFoundResponse({ description: 'Expense not found' })
  @ApiHeader({ name: 'x-user-id', description: 'User ID', required: true })
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: CreateExpenseDto,
    @Headers('x-user-id') userId: string,
  ): Promise<ExpenseDto> {
    return this.expensesService.update(id, updateExpenseDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiResponse({ status: 200, description: 'Expense deleted successfully' })
  @ApiNotFoundResponse({ description: 'Expense not found' })
  @ApiHeader({ name: 'x-user-id', description: 'User ID', required: true })
  delete(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ): Promise<void> {
    return this.expensesService.delete(id, userId);
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get dashboard data including current month stats and comparisons',
  })
  @ApiResponse({ status: 200, type: DashboardDataDto })
  @ApiHeader({ name: 'x-user-id', description: 'User ID', required: true })
  getDashboardData(
    @Query() query: GetExpensesQuery,
    @Headers('x-user-id') userId: string,
  ): Promise<DashboardDataDto> {
    return this.expensesService.getDashboardData(userId, query.month);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export expenses as CSV for a specific month' })
  @ApiHeader({ name: 'x-user-id', description: 'User ID', required: true })
  async getExpensesForExport(
    @Query('month') month: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.expensesService.getExpensesForExport(userId, month);
  }
}
