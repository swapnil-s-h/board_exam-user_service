import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from './entity/user.entity';

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

  @Get('all')
  @Roles(Role.moderator)
  getAllUsers() {
    return this.userService.findAll();
  }

  @Get('students')
  @Roles(Role.moderator)
  getAllStudents() {
    return this.userService.findAllStudents();
  }

  @Get(':id')
  @Roles(Role.moderator)
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }
}
