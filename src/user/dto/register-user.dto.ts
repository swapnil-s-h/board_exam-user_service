import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { Role } from '../entity/user.entity';

export class RegisterUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  rollNo?: number;

  @MinLength(6)
  password!: string;

  @IsEnum(Role)
  role!: Role;
}
