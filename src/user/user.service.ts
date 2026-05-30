import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async register(dto: RegisterUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const user = this.userRepository.create({
        ...dto,
        password: hashedPassword,
      });

      const savedUser = await this.userRepository.save(user);
      const { password, refreshToken, ...response } = savedUser;
      return response;
    } catch (e) {
      if (this.isPostgresError(e) && e.code === '23505') {
        throw new ConflictException(e.detail);
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  isPostgresError(e: unknown): e is { code: string; detail: string } {
    return typeof e === 'object' && e !== null && 'code' in e && 'detail' in e;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async updateRefreshToken(userId: number, refreshTokenHash: string) {
    await this.userRepository.update(userId, {
      refreshToken: refreshTokenHash,
    });
  }
}
