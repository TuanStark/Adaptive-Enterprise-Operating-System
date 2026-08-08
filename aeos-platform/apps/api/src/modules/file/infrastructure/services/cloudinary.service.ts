import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { StoragePort, UploadedFileDto } from '../../application/ports/storage.port';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService implements StoragePort {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly env: string;

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
      api_key: process.env.CLOUDINARY_API_KEY || 'demo',
      api_secret: process.env.CLOUDINARY_API_SECRET || 'demo',
    });
    this.env = process.env.NODE_ENV || 'development';
  }

  private getFolderType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'images';
    if (mimeType.startsWith('video/')) return 'videos';
    return 'documents';
  }

  private getResourceType(mimeType?: string): 'image' | 'video' | 'raw' | 'auto' {
    if (!mimeType) return 'raw';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'raw';
  }

  async uploadFile(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadedFileDto> {
    return new Promise((resolve, reject) => {
      const folder = this.getFolderType(mimeType);
      const publicId = `aeos/${this.env}/${folder}/${Date.now()}-${fileName}`;
      const resourceType = this.getResourceType(mimeType) === 'raw' ? 'raw' : 'auto';

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          public_id: publicId,
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

  async getFileUrl(storageKey: string, mimeType?: string): Promise<string> {
    const resourceType = this.getResourceType(mimeType);
    return cloudinary.url(storageKey, { resource_type: resourceType, secure: true });
  }
}
