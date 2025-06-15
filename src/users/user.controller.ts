import { Controller, Get, Post, Patch, Param, Put, Body, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateUserDto } from '../auth/dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // yêu cầu login
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
  async createUser(@Body() body: any) {
    return this.usersService.create(body);
  }

  @Put(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
    }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

}
