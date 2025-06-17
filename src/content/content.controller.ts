// D:\backend\src\content\content.controller.ts
import { Controller, Get, Post, Put, Patch, Param, Body, Delete, UseGuards, Req, UseInterceptors, UploadedFile, Query, BadRequestException } from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentGateway } from './content.gateway';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { randomUUID } from 'crypto';
import { extname } from 'path';


@Controller('contents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private contentGateway: ContentGateway,
  ) {}

@Get()
@Roles('admin', 'editor')
findAll() {
  return this.contentService.findAll();
}

@Get(':id')
@Roles('admin', 'editor')
findOne(@Param('id') id: string) {
  return this.contentService.findById(id);
}

@Post()
@Roles('admin', 'editor')
async create(@Body() dto: CreateContentDto, @Req() req) {
  const userEmail = req.user?.email;
  const created = await this.contentService.create(dto, userEmail);

  this.contentGateway.server.emit('newContent', created);

  return created;
}

@Put(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'editor')
async update(
  @Param('id') id: string,
  @Body() updateContentDto: UpdateContentDto,
  @Req() req
) {
  const updated = await this.contentService.update(id, updateContentDto, req.user.sub);

  this.contentGateway.server.emit('updateContent', updated);

  return updated;
}

@Patch(':id/submit')
@Roles('editor')
async submit(@Param('id') id: string, @Req() req) {
  const userId = req.user.sub;
  const content = await this.contentService.submit(id, userId);
  this.contentGateway.emitNewContent(content);
  return content;
}

@Delete(':id')
@Roles('admin')
async delete(@Param('id') id: string) {
  return this.contentService.delete(id);
}

@Post("upload")
@UseInterceptors(FileInterceptor("file"))
async uploadFile(
  @UploadedFile() file: Express.Multer.File,
  @Query('type') type: string,
): Promise<{ url: string }> {
  if (!file) {
    throw new BadRequestException('File is required');
  }
  if (!['image', 'video'].includes(type)) {
    throw new BadRequestException('Invalid type');
  }
  const blobName = `${type}s/${randomUUID()}${extname(file.originalname)}`;
  const contentType = file.mimetype;

  const url = await this.contentService.uploadToAzureBlob(file.buffer, blobName, contentType);
  return { url };
}
}
