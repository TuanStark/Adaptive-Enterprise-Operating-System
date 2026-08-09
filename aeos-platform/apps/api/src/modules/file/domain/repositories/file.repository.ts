import { File } from '../aggregates/file.aggregate';

export const FILE_REPOSITORY = Symbol('FILE_REPOSITORY');

export interface FileRepository {
  save(file: File): Promise<void>;
  findById(id: string): Promise<File | null>;
  findByIds(ids: string[]): Promise<File[]>;
}
