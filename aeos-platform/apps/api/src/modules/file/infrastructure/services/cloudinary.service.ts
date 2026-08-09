import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { StoragePort, SignatureDto } from '../../application/ports/storage.port';

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

  async getFileUrl(storageKey: string, mimeType?: string): Promise<string> {
    const resourceType = this.getResourceType(mimeType);
    return cloudinary.url(storageKey, { resource_type: resourceType, secure: true });
  }

  generateSignature(folderType: string): SignatureDto {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = `aeos/${this.env}/${folderType}`;
    const paramsToSign = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET || 'demo',
    );

    return {
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY || 'demo',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
      folder,
    };
  }
}
