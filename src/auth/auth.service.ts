import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/user/entity/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    user.refreshToken = hashedRefreshToken;
    await this.userService.updateRefreshToken(user.userId, hashedRefreshToken);

    return tokens;
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.userService.findById(payload.sub);
      const matches = await bcrypt.compare(refreshToken, user!.refreshToken!);
      if (!matches) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const tokens = await this.generateTokens(user!);
      return tokens;
    } catch (e) {
      throw new UnauthorizedException(e);
    }
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(currentUser) {
    try {
      const user = await this.userService.findById(currentUser.sub);
      if (!user?.refreshToken) {
        throw new UnauthorizedException('User already logged out');
      }
      await this.userService.updateRefreshToken(user!.userId, null);
      return { message: 'Logout successful' };
    } catch (e) {
      throw new UnauthorizedException(e);
    }
  }
}
