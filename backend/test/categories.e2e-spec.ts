import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean the tables before each test
    await prisma.expense.deleteMany();
    await prisma.category.deleteMany();
  });

  describe('/categories (POST)', () => {
    it('should create a new category', () => {
      const category = {
        name: 'Test Category',
        color: '#FF0000',
      };

      return request(app.getHttpServer())
        .post('/categories')
        .send(category)
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject(category);
          expect(res.body).toHaveProperty('id');
        });
    });

    it('should validate category input', () => {
      return request(app.getHttpServer())
        .post('/categories')
        .send({ name: '', color: 'invalid-color' })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe('Bad Request');
          expect(res.body.message).toEqual(expect.any(Array));
        });
    });
  });

  describe('/categories (GET)', () => {
    beforeEach(async () => {
      // Seed some test categories
      await prisma.category.createMany({
        data: [
          { name: 'Food', color: '#FF0000' },
          { name: 'Transport', color: '#00FF00' },
        ],
      });
    });

    it('should return all categories', () => {
      return request(app.getHttpServer())
        .get('/categories')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(2);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('color');
        });
    });
  });
}); 