import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

describe('ExpensesController', () => {
  let controller: ExpensesController;
  let service: ExpensesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [
        {
          provide: ExpensesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ExpensesController>(ExpensesController);
    service = module.get<ExpensesService>(ExpensesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
