import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { Prisma } from '@prisma/client';

describe('ExpensesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let categoryId: string;
  const TEST_USER_ID = '00000000-0000-0000-0000-000000000000';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);

    // Apply the same middleware as in main.ts
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.enableCors({ origin: 'http://localhost:3000' });

    await app.init();

    // Create test user
    await prisma.user.upsert({
      where: { id: TEST_USER_ID },
      update: {},
      create: {
        id: TEST_USER_ID,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
      },
    });
  });

  beforeEach(async () => {
    // Clean up and recreate test data before each test
    await prisma.expense.deleteMany();
    await prisma.category.deleteMany();

    // Create a test category
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        color: '#FF0000',
      },
    });
    categoryId = category.id;
  });

  afterAll(async () => {
    // Clean up all test data
    await prisma.expense.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  describe('/expenses (POST)', () => {
    it('should create a new expense', async () => {
      const expense = {
        note: 'Test Expense',
        amount: '99.99',
        date: '2024-03-20',
        categoryId,
      };

      const response = await request(app.getHttpServer())
        .post('/expenses')
        .send(expense);

      console.log('Response:', response.body);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        note: expense.note,
        amount: expense.amount,
        categoryId: expense.categoryId,
        category: expect.objectContaining({
          id: categoryId,
          name: 'Test Category',
          color: '#FF0000',
        }),
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body.date).toBe(expense.date);
    });

    it('should validate expense input', () => {
      return request(app.getHttpServer())
        .post('/expenses')
        .send({
          note: '',
          amount: 'invalid-amount',
          date: 'invalid-date',
          categoryId: 'invalid-id',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe('Bad Request');
          expect(res.body.message).toEqual(expect.any(Array));
        });
    });
  });

  describe('/expenses (GET)', () => {
    beforeEach(async () => {
      // Seed some test expenses
      await prisma.expense.create({
        data: {
          note: 'March Expense 1',
          amount: new Prisma.Decimal('100.00'),
          date: new Date('2024-03-01'),
          categoryId,
          userId: TEST_USER_ID,
        },
      });

      await prisma.expense.create({
        data: {
          note: 'March Expense 2',
          amount: new Prisma.Decimal('200.00'),
          date: new Date('2024-03-15'),
          categoryId,
          userId: TEST_USER_ID,
        },
      });

      await prisma.expense.create({
        data: {
          note: 'April Expense',
          amount: new Prisma.Decimal('300.00'),
          date: new Date('2024-04-01'),
          categoryId,
          userId: TEST_USER_ID,
        },
      });
    });

    it('should return expenses for a specific month', () => {
      return request(app.getHttpServer())
        .get('/expenses?month=2024-03')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(2);
          res.body.forEach((expense) => {
            expect(expense).toHaveProperty('id');
            expect(expense).toHaveProperty('note');
            expect(expense).toHaveProperty('amount');
            expect(expense).toHaveProperty('date');
            expect(expense).toHaveProperty('category');
            expect(expense.category).toHaveProperty('id', categoryId);
          });
        });
    });

    it('should validate month parameter', () => {
      return request(app.getHttpServer())
        .get('/expenses?month=invalid-month')
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe('Bad Request');
        });
    });
  });
}); 