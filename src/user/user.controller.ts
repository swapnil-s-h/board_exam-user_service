import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from './entity/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Post('upload')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @GetUser() user) {
    try {
      const result = await this.userService.uploadImage(file.buffer);
      await this.userService.updateProfileUrl(user.sub, result.secure_url);
      return result;
    } catch (e) {
      console.error('error uploading image ', e);
      throw new Error('Failed to upload image');
    }
  }
}
