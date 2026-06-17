import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GetUser } from './decorators/get-user.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  @ApiBody({
    description: 'User details to login',
    type: LoginDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    example: ['User does not exist', 'Invalid credentials'],
  })
  @ApiOkResponse({
    description: 'Login Successful',
    type: LoginResponseDto,
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({ summary: 'To refresh access token after it expires' })
  @ApiBody({
    description:
      'Valid refresh token to generate new access token as well as new refresh token',
    type: RefreshTokenDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid refresh token',
  })
  @ApiOkResponse({
    description: 'Tokens refreshed. New tokens created with new expiries.',
    type: LoginResponseDto,
  })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Logout Successful',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    example: ['Invalid JWT token', 'User already logged out'],
  })
  async logout(@GetUser() user) {
    return this.authService.logout(user);
  }
}
