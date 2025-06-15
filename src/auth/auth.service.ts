import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/user.service';
import { RedisService } from '../redis/redis.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    console.log('Found user:', user); // Debug 
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id, role: user.role };
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
