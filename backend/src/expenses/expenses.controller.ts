import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseDto } from './dto/expense.dto';

@ApiTags('Expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'Expense created successfully',
    type: ExpenseDto,
  })
  create(@Body() createExpenseDto: CreateExpenseDto): Promise<ExpenseDto> {
    return this.expensesService.create(createExpenseDto);
  }

  @Get()
  @ApiQuery({
    name: 'month',
    description: 'Month in YYYY-MM format',
    example: '2024-03',
    required: true,
  })
  @ApiOkResponse({
    description: 'List of expenses',
    type: [ExpenseDto],
  })
  findAll(@Query('month') month: string): Promise<ExpenseDto[]> {
    return this.expensesService.findAll(month);
  }
}
