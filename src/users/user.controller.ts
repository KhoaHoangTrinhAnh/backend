// D:\backend\src\users\user.controller.ts
import { Controller, Get, Post, Req, Param, Put, Body, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { User } from './user.schema';
import { Request } from 'express';

interface SafeRequest extends Request {
  user?: {
    email?: string;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  create(@Body() body: Partial<User>, @Req() req: SafeRequest) {
    const created_by = req.user?.email;
    return this.usersService.create({ ...body, created_by });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<User>, @Req() req: SafeRequest) {
    const updated_by = req.user?.email;
    return this.usersService.update(id, { ...body, updated_by });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

}
