export const STORAGE_PORT = Symbol('STORAGE_PORT');

export interface UploadedFileDto {
  storageKey: string;
  url: string;
  provider: string;
}

export interface SignatureDto {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export interface StoragePort {
  getFileUrl(storageKey: string, mimeType?: string): Promise<string>;
  generateSignature(folderType: string): SignatureDto;
}
