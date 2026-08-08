import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { StoragePort, UploadedFileDto } from '../../application/ports/storage.port';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService implements StoragePort {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
      api_key: process.env.CLOUDINARY_API_KEY || 'demo',
      api_secret: process.env.CLOUDINARY_API_SECRET || 'demo',
    });
  }

  async uploadFile(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadedFileDto> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          public_id: `aeos/documents/${Date.now()}-${fileName}`,
        },
        (error, result) => {
          if (error) {
            this.logger.error('Failed to upload file to Cloudinary', error);
            return reject(error);
          }
          resolve({
            storageKey: result!.public_id,
            url: result!.secure_url,
            provider: 'CLOUDINARY',
          });
        },
      );
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  async getFileUrl(storageKey: string): Promise<string> {
    return cloudinary.url(storageKey, { resource_type: 'raw', secure: true });
  }
}
