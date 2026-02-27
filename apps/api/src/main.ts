import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:4000'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('CareCanvas API')
    .setDescription('REST API voor CareCanvas — het inclusieve co-creatieplatform voor zorginnovatie')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authenticatie & autorisatie')
    .addTag('users', 'Gebruikersbeheer')
    .addTag('projects', 'Projecten & ideeën')
    .addTag('artifacts', 'Artefacten (User Stories, specificaties)')
    .addTag('ai', 'AI-diensten (Sparring-Partner, Spec-Generator)')
    .addTag('library', 'Open-Source Bibliotheek')
    .addTag('community', 'Community & Rol-Matching')
    .addTag('canvas', 'Canvas & bestandsupload')
    .addTag('fhir', 'FHIR R4/R5 export')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.API_PORT ?? 4001;
  await app.listen(port);
  logger.log(`CareCanvas API draait op: http://localhost:${port}`);
  logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
