// D:\backend\src\auth\auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/user.service';
import { RedisService } from '../redis/redis.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../types/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

async validateUser(email: string, password: string): Promise<User> {
  const user = await this.userService.findByEmail(email);
  if (!user) throw new UnauthorizedException('Tài khoản không tồn tại');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new UnauthorizedException('Sai mật khẩu');

  return user as unknown as User; // nếu TypeScript vẫn cảnh báo, ép kiểu thủ công
}

  async login(body: { email: string; password: string }) {
    const { email, password } = body;

    const user = await this.validateUser(email, password);

    const payload = {
      email: user.email,
      sub: user._id.toString(),
      role: user.role,
    };

    const token = this.jwtService.sign(payload);
    await this.redisService.set(token, user._id.toString());

    return { access_token: token };
  }


  async logout(token: string) {
  await this.redisService.del(token);
}

  async signup(dto: CreateUserDto) {
    const { email, password, name, role } = dto;

    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const user = await this.userService.create({
      email,
      name,
      password,
      role,
    });

  return { message: 'User created', user };
}
}
