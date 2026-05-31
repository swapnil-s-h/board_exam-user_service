import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  @Public()
  register(@Body() dto: RegisterUserDto) {
    return this.userService.register(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@GetUser() user) {
    return user;
  }
}
