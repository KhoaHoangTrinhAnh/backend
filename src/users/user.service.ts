import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  async create(userDto: {
    email: string;
    name: string;
    password: string;
    role?: string;
  }): Promise<User> {
    const hashed = await bcrypt.hash(userDto.password, 10);
    return this.userModel.create({
      ...userDto,
      password: hashed,
    });
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findById(id: string): Promise<User | null> { //Find User
    return this.userModel.findById(id);
  }

  async update(id: string, updateUserDto: any): Promise<User | null> { //Update User
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  async remove(id: string): Promise<any> { //Remove User
    return this.userModel.findByIdAndDelete(id);
  }

  async findByName(name: string) {
    return this.userModel.findOne({ name });
  }

}
