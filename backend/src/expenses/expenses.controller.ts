import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseDto } from './dto/expense.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
}
