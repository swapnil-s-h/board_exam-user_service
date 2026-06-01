import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRY: Joi.string().required(),
        REFRESH_TOKEN_EXPIRY: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().required(),
        INTERNAL_API_KEY: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        CLOUD_NAME: Joi.string().required(),
        CLOUDINARY_API_KEY: Joi.string().required(),
        CLOUDINARY_API_SECRET: Joi.string().required(),
        PORT: Joi.number().default(3001),
      }),
    }),
    UserModule,
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {
  /*
  constructor(private dataSource: DataSource) {
    console.log(`data source ${dataSource.driver.database}`);
    console.log(
      `JWT_SECRET ${process.env.JWT_SECRET} ${typeof process.env.JWT_SECRET}`,
    );
    console.log(
      `JWT_EXPIRY ${process.env.JWT_EXPIRY} ${typeof process.env.JWT_EXPIRY}`,
    );
    console.log(
      `REFRESH_TOKEN_EXPIRY ${process.env.REFRESH_TOKEN_EXPIRY} ${typeof process.env.REFRESH_TOKEN_EXPIRY}`,
    );
    console.log(`DB_HOST ${process.env.DB_HOST} ${typeof process.env.DB_HOST}`);
    console.log(`DB_PORT ${process.env.DB_PORT} ${typeof process.env.DB_PORT}`);
    console.log(
      `INTERNAL_API_KEY ${process.env.INTERNAL_API_KEY} ${typeof process.env.INTERNAL_API_KEY}`,
    );
    console.log(`DB_NAME ${process.env.DB_NAME} ${typeof process.env.DB_NAME}`);
    console.log(
      `DB_PASSWORD ${process.env.DB_PASSWORD} ${typeof process.env.DB_PASSWORD}`,
    );
    console.log(
      `CLOUD_NAME ${process.env.CLOUD_NAME} ${typeof process.env.CLOUD_NAME}`,
    );
    console.log(
      `CLOUDINARY_API_KEY ${process.env.CLOUDINARY_API_KEY} ${typeof process.env.CLOUDINARY_API_KEY}`,
    );
    console.log(
      `CLOUDINARY_API_SECRET ${process.env.CLOUDINARY_API_SECRET} ${typeof process.env.CLOUDINARY_API_SECRET}`,
    );
  }
  */
}
