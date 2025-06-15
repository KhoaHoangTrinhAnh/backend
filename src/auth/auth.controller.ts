// D:\backend\src\auth\auth.controller.ts
import { Controller, Post, Body, Req, Res, UseGuards, UnauthorizedException, BadRequestException } from '@nestjs/common';
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

    @Post('login')
    async login(
      @Body() body: { email: string; password: string },
      @Res({ passthrough: true }) res: Response
    ) {
      const user = await this.authService.validateUser(body.email, body.password);
      if (!user || !(await compare(body.password, user.password))) {
        throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
      }

      const jwt = await this.authService.login(user);

      res.cookie('jwt', jwt, {
        httpOnly: true,
        secure: false, // true nếu dùng HTTPS
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 ngày
      });

      return {
        message: 'Đăng nhập thành công',
        access_token: jwt,
      };
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

