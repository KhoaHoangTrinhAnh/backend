// D:\backend\src\content\content.controller.ts
import { Controller, Get, Post, Patch, Param, Body, Delete, UseGuards, Req, UseInterceptors, UploadedFile, Query, BadRequestException } from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentGateway } from './content.gateway';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('contents')
// @UseGuards(JwtAuthGuard, RolesGuard) tạm bỏ để sửa code
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
  //@Roles('admin', 'editor')
  async create(@Body() dto: CreateContentDto, @Req() req) {
    const userId = req.user?.sub || 'anonymous'; // fallback khi guard bị tắt
    const created = await this.contentService.create(dto, userId);

    this.contentGateway.server.emit('newContent', created);

    return created;
  }

  @Patch(':id')
  @Roles('admin', 'editor')
  update(@Param('id') id: string, @Body() dto: UpdateContentDto, @Req() req) {
    const userId = req.user.sub;
    return this.contentService.update(id, dto, userId);
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
  delete(@Param('id') id: string) {
    return this.contentService.delete(id);
  }

@Post("upload")
@UseInterceptors(FileInterceptor("file"))
async uploadFile(
  @UploadedFile() file: Express.Multer.File,
  @Query("type") type: "image" | "video"
) {
  if (!file) throw new BadRequestException("No file uploaded");

  const ext = file.originalname.split(".").pop()?.toLowerCase();
  const blobName = `${type}/${Date.now()}-${file.originalname}`;

  const url = await this.contentService.uploadToAzureBlob(file.buffer, blobName, file.mimetype);
  return { url };
}


}
