// D:\backend\src\main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import './types/express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
