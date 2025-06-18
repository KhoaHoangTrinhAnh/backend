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
import { Request } from 'express';

@Controller('contents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private contentGateway: ContentGateway,
  ) {}
req: Request & { user?: { email?: string; sub?: string } }

@Get()
@Roles('admin', 'editor', 'client')
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
async create(@Body() dto: CreateContentDto, @Req() req: Request & { user?: { email?: string } }) {
  const userEmail = req.user?.email ?? 'unknown';
  const created = await this.contentService.create(dto, userEmail);
  this.contentGateway.server.emit('newContent', created);
  return created;
}

@Put(':id')
@Roles('admin', 'editor')
async update(
  @Param('id') id: string,
  @Body() updateContentDto: UpdateContentDto,
  @Req() req: Request & { user?: { sub?: string } }
) {
  const updatedBy = req.user?.sub ?? 'unknown';
  const updated = await this.contentService.update(id, updateContentDto, updatedBy);
  this.contentGateway.server.emit('updateContent', updated);
  return updated;
}

@Patch(':id/submit')
@Roles('admin', 'editor')
async submit(@Param('id') id: string, @Req() req: Request & { user?: { sub?: string } }) {
  const userId = req.user?.sub ?? 'unknown';
  const content = await this.contentService.submit(id, userId);
  this.contentGateway.emitNewContent(content);
  return content;
}

@Delete(':id')
@Roles('admin', 'editor')
async delete(@Param('id') id: string) {
  return this.contentService.delete(id);
}

@Post("upload")
@Roles('admin', 'editor')
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
