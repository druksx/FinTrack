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
    await prisma.expense.deleteMany();
    await prisma.category.deleteMany();
  });

  describe('/categories (POST)', () => {
    it('should create a new category', () => {
      const category = {
        name: 'Test Category',
        color: '#FF0000',
        icon: 'Star',
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
        .send({ name: '', color: 'invalid-color', icon: '' })
        .expect(400)
        .expect((res) => {
          expect(res.body.error).toBe('Bad Request');
          expect(res.body.message).toEqual(expect.any(Array));
        });
    });
  });

  describe('/categories (GET)', () => {
    it('should return all categories', async () => {
      await prisma.category.createMany({
        data: [
          { name: 'Food', color: '#FF0000', icon: 'Utensils', userId: '1' },
          { name: 'Transport', color: '#00FF00', icon: 'Car', userId: '1' },
        ],
      });

      return request(app.getHttpServer())
        .get('/categories')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('color');
          expect(res.body[0]).toHaveProperty('icon');
          const names = res.body.map((c) => c.name).sort();
          expect(names).toContain('Food');
          expect(names).toContain('Transport');
        });
    });
  });
});