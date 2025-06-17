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

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password'); // ẩn password trả về frontend
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).select('-password'); // ẩn password trả về frontend
  }

  async findByName(name: string) {
    return this.userModel.findOne({ name });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  async create(userDto: any): Promise<User> {
    const hashed = await bcrypt.hash(userDto.password, 10);
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

  async update(id: string, updateUserDto: any): Promise<User | null> {
    const updateData: any = {
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
