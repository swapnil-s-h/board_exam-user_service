import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  RegisterUserDto,
  RegisterUserResponseDto,
} from './dto/register-user.dto';
import { UserService } from './user.service';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from './entity/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileUploadDto } from './dto/file-upload.dto';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({
    description: 'User details',
    type: RegisterUserDto,
  })
  @ApiBadRequestResponse({
    description: 'Array of validaton error messages',
    example: [
      'name must be a string',
      'email must be an email',
      'password must be longer than or equal to 6 characters',
      'role must be one of the following values: STUDENT, MODERATOR',
      'Student must have a roll number',
      'Moderator cannot have roll number',
    ],
  })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: RegisterUserResponseDto,
    examples: {
      student: {
        summary: 'Student user created',
        value: {
          userId: 1,
          name: 'Swapnil',
          email: 'swapnil@gmail.com',
          rollNo: 12,
          role: 'STUDENT',
          profilePhotoUrl: null,
          createdAt: '2026-06-17T05:38:15.528Z',
          updatedAt: '2026-06-17T05:38:15.528Z',
        },
      },
      moderator: {
        summary: 'Moderator user created',
        value: {
          userId: 2,
          name: 'Rahul',
          email: 'rahul@gmail.com',
          rollNo: null,
          role: 'MODERATOR',
          profilePhotoUrl: null,
          createdAt: '2026-06-17T05:53:16.240Z',
          updatedAt: '2026-06-17T05:53:16.240Z',
        },
      },
    },
  })
  @ApiConflictResponse({
    description: 'Email or Roll No already exists',
    example: ['Email already exists', 'Key (roll_no)=(12) already exists.'],
  })
  register(@Body() dto: RegisterUserDto) {
    return this.userService.register(dto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get the user profile information who is currently logged in.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiOkResponse({
    description: 'User profile fetched successfully',
    example: {
      sub: 2,
      email: 'rahul@gmail.com',
      role: 'MODERATOR',
      iat: 1781676483,
      exp: 1782281283,
    },
  })
  profile(@GetUser() user) {
    return user;
  }

  @Get('all')
  @Roles(Role.moderator)
  @ApiOperation({
    summary: 'Get all users information. This endpoint is only for MODERATOR',
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiOkResponse({
    description: 'All users fetched',
    type: [RegisterUserResponseDto],
  })
  @ApiForbiddenResponse({
    description:
      'Forbidden resource - Only moderators have access to all users data',
  })
  getAllUsers() {
    return this.userService.findAll();
  }

  @Get('students')
  @Roles(Role.moderator)
  @ApiOperation({
    summary:
      'Get all students information. This endpoint is only for MODERATOR',
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiOkResponse({
    description: 'All students fetched',
    type: [RegisterUserResponseDto],
  })
  @ApiForbiddenResponse({
    description:
      'Forbidden resource - Only moderators have access to all students data',
  })
  getAllStudents() {
    return this.userService.findAllStudents();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  @ApiOperation({ summary: 'To upload the profile picture' })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Profile photo uploaded',
    example: {
      asset_id: 'b3bf44483d5461b86fe1fd23eec469ad',
      public_id: 'user_profile/ubbdvsepxtdei3fqgcx7',
      version: 1781677728,
      version_id: '55f1860d826e320ee3d48f4d3a87be51',
      signature: '6c956f816ea22c09c7e3e3e461f22be0f6b8ebcd',
      width: 1022,
      height: 908,
      format: 'png',
      resource_type: 'image',
      created_at: '2026-06-17T06:28:48Z',
      tags: [],
      bytes: 283728,
      type: 'upload',
      etag: 'a106ee1d4382e40636771af50f20977a',
      placeholder: false,
      url: 'http://res.cloudinary.com/drvirl5zq/image/upload/v1781677728/user_profile/ubbdvsepxtdei3fqgcx7.png',
      secure_url:
        'https://res.cloudinary.com/drvirl5zq/image/upload/v1781677728/user_profile/ubbdvsepxtdei3fqgcx7.png',
      folder: 'user_profile',
      original_filename: 'file',
      api_key: '667918892328321',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to upload image',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Profile picture',
    type: FileUploadDto,
  })
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
