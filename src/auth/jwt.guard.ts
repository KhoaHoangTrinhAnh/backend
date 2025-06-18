// D:\backend\src\auth\jwt.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { Request } from 'express';

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
}


@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers.authorization;

    if (!authHeader) return false;

    const token = authHeader.split(' ')[1];
    if (!token) return false;

    const valid = await this.redisService.get(token);
    if (!valid) return false;

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        ignoreExpiration: false,
      });


      req.user = payload;
      return true;
    } catch {
      return false;
    }
  }
}
