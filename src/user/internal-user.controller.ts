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

@Controller('internal/users')
@UseGuards(InternalApiKeyGuard)
export class InternalUserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @Public()
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }
}
