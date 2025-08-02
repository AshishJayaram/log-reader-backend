import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend access
  app.enableCors();

  // Global validation pipe (needed for DTOs in Step 10)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('Vehicle Diagnostics API')
    .setDescription('Upload and query vehicle diagnostic logs')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // This mounts Swagger at /api

  await app.listen(3000);
}
bootstrap();
