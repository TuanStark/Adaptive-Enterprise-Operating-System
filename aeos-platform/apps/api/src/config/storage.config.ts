import { registerAs } from '@nestjs/config';

export const storageConfig = registerAs('storage', () => ({
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    isConfigured:
      !!process.env.CLOUDINARY_CLOUD_NAME &&
      !!process.env.CLOUDINARY_API_KEY &&
      !!process.env.CLOUDINARY_API_SECRET,
  },

  s3: {
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'ap-southeast-1',
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    bucket: process.env.S3_BUCKET || 'aeos-uploads',
    useIrsa: process.env.S3_USE_IRSA === 'true',
    isConfigured: !!process.env.S3_ENDPOINT || process.env.S3_USE_IRSA === 'true',
  },

  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10),
  allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || 'image/*,application/pdf,video/*').split(','),
}));

export type StorageConfig = ReturnType<typeof storageConfig>;
