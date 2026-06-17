import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('User Service')
    .setDescription(
      'User microservice has 2 modules - auth and user. This microservice handles user authentication and management.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag(
      'user',
      'Register new user, fetch user information and upload profile picture.',
    )
    .addTag('auth', 'Login existing user. Refresh Token. Logout user.')
    .build();
  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);
  await app.listen(process.env.PORT!);
}
bootstrap();
