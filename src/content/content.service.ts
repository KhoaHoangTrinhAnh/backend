// D:\backend\src\content\content.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content, ContentDocument } from './content.schema';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { BlobServiceClient } from '@azure/storage-blob';
import { ContentGateway } from './content.gateway';
import { URL } from 'url';

@Injectable()
export class ContentService {
  private readonly blobServiceClient: BlobServiceClient;
  private readonly azureContainerName: string;

  constructor(
    @InjectModel(Content.name)
    private contentModel: Model<ContentDocument>,
    private readonly gateway: ContentGateway,
  ) {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING!,
    );
    this.azureContainerName = process.env.AZURE_CONTAINER_NAME!;
  }

  async findAll() {
    //return this.contentModel.find({ status: 'submitted' }).exec();
      return this.contentModel.find().exec();
  }

  async findById(id: string) {
    const content = await this.contentModel.findById(id);
    if (!content) throw new NotFoundException('Content not found');
    return content;
  }

  async create(dto: CreateContentDto, email: string) {
  const created = new this.contentModel({
    ...dto,
    created_by: email,
    updated_by: email,
    created_at: new Date(),
    updated_at: new Date(),
    status: 'submitted',
  });
    const result = await created.save();

    this.gateway.emitNewContent(result);
    return result;
  }

async update(id: string, dto: UpdateContentDto, updatedBy: string) {
  const existing: ContentDocument | null = await this.contentModel.findById(id);
  if (!existing) throw new NotFoundException('Content not found');

  const oldUrls = (existing.blocks || [])
    .filter(b => b.type === 'image' || b.type === 'video')
    .map(b => b.value);

  const newUrls = (dto.blocks || [])
    .filter(b => b.type === 'image' || b.type === 'video')
    .map(b => b.value);

  const removedUrls = oldUrls.filter(url => !newUrls.includes(url));

  for (const url of removedUrls) {
    await this.deleteAzureBlob(url);
  }

  if (dto.title !== undefined) {
    existing.title = dto.title;
  }
  if (dto.blocks !== undefined) {
    existing.blocks = dto.blocks;
  }
  existing.updated_by = updatedBy;
  existing.updated_at = new Date();

  const result = await existing.save();

  this.gateway.emitNewContent(result);

  return result;
}

private extractMediaUrls(blocks: unknown[]): string[] {
  if (!Array.isArray(blocks)) return [];

  return blocks
    .filter((b): b is { type: string; value: string } =>
      typeof b === 'object' &&
      b !== null &&
      'type' in b &&
      'value' in b &&
      (b as any).type &&
      (b as any).value &&
      (typeof (b as any).type === 'string') &&
      (typeof (b as any).value === 'string')
    )
    .filter(b => b.type === 'image' || b.type === 'video')
    .map(b => b.value);
}

  private async deleteAzureBlob(fileUrl: string) {
    try {
      const url = new URL(fileUrl);
      const fullPath = decodeURIComponent(url.pathname.replace(/^\/+/, '')); // image-video/images/abc.jpg
      const containerName = this.azureContainerName; // image-video

      // Cắt bỏ phần "image-video/" để chỉ còn "images/abc.jpg"
      const blobPath = fullPath.startsWith(containerName + '/')
        ? fullPath.substring(containerName.length + 1)
        : fullPath;

      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      const blobClient = containerClient.getBlockBlobClient(blobPath);

      await blobClient.deleteIfExists();
      console.log(`Deleted blob: ${blobPath}`);
    } catch (err) {
      console.error(`Failed to delete blob: ${fileUrl}`, err.message);
    }
  }

  async delete(id: string) {
    const deleted = await this.contentModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Content not found');

    // Xoá media trong Azure Blob
    const mediaUrls = this.extractMediaUrls(deleted.blocks);
    for (const url of mediaUrls) {
      await this.deleteAzureBlob(url);
    }

    // Emit sự kiện xoá content về client (realtime)
    this.gateway.server.emit('deleteContent', { id });
    return deleted;
  }

  async submit(id: string, updatedBy: string) {
    const content = await this.contentModel.findByIdAndUpdate(
      id,
      {
        status: 'submitted',
        updated_by: updatedBy,
        updated_at: new Date(),
      },
      { new: true },
    );
    if (!content) throw new NotFoundException('Content not found');
    return content;
  }

  async uploadToAzureBlob(buffer: Buffer, blobName: string, contentType: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(this.azureContainerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: contentType },
    });

    return blockBlobClient.url;
  }

}