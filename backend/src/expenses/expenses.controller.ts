import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseDto } from './dto/expense.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

class GetExpensesQuery {
  @IsDateString({ strict: false })
  month: string;
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
