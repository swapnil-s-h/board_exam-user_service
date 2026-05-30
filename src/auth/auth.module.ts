import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: 'qW4dL22',
      signOptions: {
        expiresIn: '15m',
      },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
