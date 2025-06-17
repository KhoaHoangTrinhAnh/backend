// D:\backend\src\auth\auth.controller.ts
import { Controller, Post, Get, Body, Req, Res, UseGuards, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { compare } from 'bcrypt';
import { UsersService } from '../users/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Req() req) {
      return req.user; // user được lấy từ token
    }

    @Post('login')
    async login(@Body() body) {
      return await this.authService.login(body);
    }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    const token = req.headers.authorization?.split(' ')[1];
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

