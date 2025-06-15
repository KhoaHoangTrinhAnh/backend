// D:\backend\src\content\content.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Content, ContentSchema } from './content.schema';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { ContentGateway } from './content.gateway';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }]),
     AuthModule, // Sử dụng JwtAuthGuard
    RedisModule, // RedisService được inject
  ],
  controllers: [ContentController],
  providers: [ContentService, ContentGateway],
})
export class ContentModule {}
