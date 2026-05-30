import { Body, Controller, Post } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Post('register')
  register(@Body() dto: RegisterUserDto) {
    return this.userService.register(dto);
  }
}
