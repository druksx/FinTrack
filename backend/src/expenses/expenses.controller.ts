import { Body, Controller, Get, Post, Put, Delete, Query, Param } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseDto } from './dto/expense.dto';
import { DashboardDataDto } from './dto/dashboard.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiNotFoundResponse } from '@nestjs/swagger';
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
  create(@Body() createExpenseDto: CreateExpenseDto): Promise<ExpenseDto> {
    return this.expensesService.create(createExpenseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses for a specific month' })
  @ApiResponse({ status: 200, type: [ExpenseDto] })
  findAll(@Query() query: GetExpensesQuery): Promise<ExpenseDto[]> {
    return this.expensesService.findAll(query.month);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an expense' })
  @ApiResponse({ status: 200, type: ExpenseDto })
  @ApiNotFoundResponse({ description: 'Expense not found' })
  update(@Param('id') id: string, @Body() updateExpenseDto: CreateExpenseDto): Promise<ExpenseDto> {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiResponse({ status: 200, description: 'Expense deleted successfully' })
  @ApiNotFoundResponse({ description: 'Expense not found' })
  delete(@Param('id') id: string): Promise<void> {
    return this.expensesService.delete(id);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard data with expense summaries and trends' })
  @ApiResponse({ status: 200, type: DashboardDataDto })
  getDashboardData(@Query() query: GetExpensesQuery): Promise<DashboardDataDto> {
    return this.expensesService.getDashboardData(query.month);
  }

  @Get('export')
  async getExpensesForExport(@Query('month') month: string) {
    return this.expensesService.getExpensesForExport(month);
  }
}
