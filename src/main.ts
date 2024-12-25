import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PORT } from './configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /* Config */
  app.enableVersioning();
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://main.d2shh7t3cvaq17.amplifyapp.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(PORT);
}
bootstrap();
