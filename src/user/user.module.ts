import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { InternalUserController } from './internal-user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController, InternalUserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
