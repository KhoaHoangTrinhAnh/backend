// D:\backend\src\upload\upload.service.ts
import { Injectable} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient, ContainerClient  } from '@azure/storage-blob';


@Injectable()
export class UploadService {
  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;

  constructor(private configService: ConfigService) {
    const account = this.configService.get<string>('AZURE_STORAGE_ACCOUNT');
    const key = this.configService.get<string>('AZURE_STORAGE_ACCESS_KEY');
    const container = this.configService.get<string>('AZURE_CONTAINER_NAME')!;

    console.log('AZURE_CONTAINER_NAME =', container); // debug log

    const connString = `DefaultEndpointsProtocol=https;AccountName=${account};AccountKey=${key};EndpointSuffix=core.windows.net`;
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connString);
    this.containerClient = this.blobServiceClient.getContainerClient(container);
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const blobName = Date.now() + "-" + file.originalname;
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
      },
    });

    return blockBlobClient.url;
  }
}
