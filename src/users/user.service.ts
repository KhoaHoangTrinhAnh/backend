// D:\backend\src\users\user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';
import { UsersGateway } from './users.gateway';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly usersGateway: UsersGateway,
  ) {}

  async findAll(): Promise<Partial<User>[]> {
    return this.userModel.find().select('-password');
  }

  async findById(id: string): Promise<Partial<User> | null> {
    return this.userModel.findById(id).select('-password');
  }

  async findByName(name: string) {
    return this.userModel.findOne({ name });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  async create(userDto: Partial<User>): Promise<User> {
    const password = userDto.password ?? '';
    const hashed = await bcrypt.hash(password, 10);
    const created = await this.userModel.create({
      ...userDto,
      password: hashed,
      created_at: new Date(),
      created_by: userDto.created_by,
    });
    this.usersGateway.emitUserUpdate();
    return created;
  }

  async remove(id: string): Promise<any> {
    this.usersGateway.emitUserUpdate();
    return this.userModel.findByIdAndDelete(id);
  }

  async update(id: string, updateUserDto: Partial<User>): Promise<User | null> {
    const updateData: Partial<User> = {
      ...updateUserDto,
      updated_at: new Date(),
      updated_by: updateUserDto.updated_by,
    };

    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updated = await this.userModel.findByIdAndUpdate(id, updateData, { new: true });
    this.usersGateway.emitUserUpdate();
    return updated;
  }
}
