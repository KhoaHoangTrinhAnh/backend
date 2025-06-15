import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  controllers: [UsersController],
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  forwardRef(() => AuthModule),
  RedisModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
