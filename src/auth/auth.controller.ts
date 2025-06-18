// D:\backend\src\auth\auth.controller.ts
import { Controller, Post, Get, Body, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from '../users/user.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Req() req: Request) {
      return req.user;
    }

    @Post('login')
    async login(@Body() body: LoginDto) {
      return await this.authService.login(body);
    }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new BadRequestException('Token không tồn tại');
    return this.authService.logout(token);
  }

  @Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    const emailExists = await this.userService.findByEmail(dto.email);
    const nameExists = await this.userService.findByName(dto.name);
    if (emailExists || nameExists) {
      throw new BadRequestException('Email hoặc tên người dùng đã tồn tại');
    }

    return this.authService.signup(dto);
  }
}

