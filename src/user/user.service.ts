import { ConflictException, Injectable } from '@nestjs/common';
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

    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);
    const { password, refreshToken, ...response } = savedUser;
    return response;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }
}
