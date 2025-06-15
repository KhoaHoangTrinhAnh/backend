// D:\backend\src\content\content.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content, ContentDocument } from './content.schema';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { BlobServiceClient } from '@azure/storage-blob';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { ContentGateway } from './content.gateway';

@Injectable()
export class ContentService {
  private readonly blobServiceClient: BlobServiceClient;
  private readonly azureContainerName: string;

  constructor(
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
    private readonly gateway: ContentGateway,
  ) {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING!,
    );
    this.azureContainerName = process.env.AZURE_CONTAINER_NAME!;
  }

  async create(dto: CreateContentDto, userId: string) {
  const created = new this.contentModel({
    ...dto,
    createdBy: userId,
    updatedBy: userId,
    status: 'submitted'
  });
    const result = await created.save();

    this.gateway.emitNewContent(result);
    return result;
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

  async update(id: string, dto: UpdateContentDto, updatedBy: string) {
    const content = await this.contentModel.findByIdAndUpdate(
      id,
      {
        ...dto,
        updated_by: updatedBy,
        updated_at: new Date(),
      },
      { new: true },
    );
    if (!content) throw new NotFoundException('Content not found');
    return content;
  }

  async delete(id: string) {
    return this.contentModel.findByIdAndDelete(id);
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