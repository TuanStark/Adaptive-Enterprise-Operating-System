import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { GenerateSignatureQuery } from './generate-signature.query';
import { StoragePort, STORAGE_PORT, SignatureDto } from '../../ports/storage.port';

export class GenerateSignatureHandler {
  constructor(@Inject(STORAGE_PORT) private readonly storagePort: StoragePort) {}

  async execute(query: GenerateSignatureQuery): Promise<Result<SignatureDto, DomainError>> {
    try {
      const signature = this.storagePort.generateSignature(query.folderType);
      return Result.ok(signature);
    } catch (error) {
      return Result.fail(error as DomainError);
    }
  }
}
