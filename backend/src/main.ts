import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  // Enable CORS for frontend
  app.enableCors({
    origin: 'http://localhost:3000',
  });

  // Apply global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Set up Swagger
  const config = new DocumentBuilder()
    .setTitle('FinTrack API')
    .setDescription('Personal expense tracker API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3333);
}
bootstrap();
