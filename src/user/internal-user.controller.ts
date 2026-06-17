import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { InternalApiKeyGuard } from './guards/internal-api-key.guard';
import { Public } from 'src/auth/decorators/public.decorator';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('internal/users')
@UseGuards(InternalApiKeyGuard)
@ApiExcludeController()
export class InternalUserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @Public()
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }
}
