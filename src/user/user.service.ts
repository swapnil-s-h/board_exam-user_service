import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    v2.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

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

  async findById(userId: number) {
    return this.userRepository.findOne({
      where: { userId },
    });
  }

  async getUserById(id: number) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, refreshToken, ...result } = user;
    return result;
  }

  async updateRefreshToken(userId: number, refreshTokenHash: string | null) {
    await this.userRepository.update(userId, {
      refreshToken: refreshTokenHash,
    });
  }

  async findAll() {
    const allUsers = await this.userRepository.find();
    const response = allUsers.map((user) => {
      const { password, refreshToken, ...userData } = user;
      return userData;
    });
    return response;
  }

  async findAllStudents() {
    const allStudents = await this.userRepository.find({
      where: { role: Role.student },
    });
    const response = allStudents.map((student) => {
      const { password, refreshToken, ...studentData } = student;
      return studentData;
    });
    return response;
  }

  async uploadImage(
    fileBuffer: Buffer,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      v2.uploader
        .upload_stream({ folder: 'user_profile' }, (error, result) => {
          if (error) return reject(error);
          if (!result) return reject('Upload error occurred');
          resolve(result);
        })
        .end(fileBuffer);
    });
  }

  async updateProfileUrl(userId: number, photoUrl: string) {
    await this.userRepository.update(userId, {
      profilePhotoUrl: photoUrl,
    });
  }
}
