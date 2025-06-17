// D:\backend\src\users\user.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';
import { UsersGateway } from './users.gateway';

@Module({
  controllers: [UsersController],
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  forwardRef(() => AuthModule),
  RedisModule,
  ],
  providers: [UsersService, UsersGateway],
  exports: [UsersService],
})
export class UsersModule {}
