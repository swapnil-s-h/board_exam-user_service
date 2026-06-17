import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty({
    description: 'Email of the user (STUDENT or MODERATOR)',
    example: 'swapnil123@gmail.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Valid Password',
    example: 'abcdef',
  })
  @IsString()
  password!: string;
}

export class LoginResponseDto {
  @IsString()
  @ApiProperty({
    description: `Access token which expires in ${process.env.JWT_EXPIRY}`,
  })
  accessToken!: string;

  @IsString()
  @ApiProperty({
    description: `Refresh token which expires in ${process.env.REFRESH_TOKEN_EXPIRY}`,
  })
  refreshToken!: string;
}
