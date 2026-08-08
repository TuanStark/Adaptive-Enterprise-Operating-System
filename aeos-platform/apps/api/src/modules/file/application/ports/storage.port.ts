export const STORAGE_PORT = Symbol('STORAGE_PORT');

export interface UploadedFileDto {
  storageKey: string;
  url: string;
  provider: string;
}

export interface StoragePort {
  uploadFile(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadedFileDto>;
  getFileUrl(storageKey: string): Promise<string>;
}
