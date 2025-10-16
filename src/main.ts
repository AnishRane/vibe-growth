import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Vibe Growth API')
    .setDescription('API for managing campaigns, analyzing intent, and tracking metrics')
    .setVersion('1.0')
    .addTag('campaigns', 'Campaign management endpoints')
    .addTag('intent', 'Natural language query endpoints')
    .addTag('health', 'Health check endpoints')
    .addTag('metrics', 'Metrics and analytics endpoints')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`Swagger documentation available at: http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
