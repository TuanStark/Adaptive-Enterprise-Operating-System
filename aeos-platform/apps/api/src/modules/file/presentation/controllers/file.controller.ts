import { Controller, Post, Get, Param, Req, Query, Body } from '@nestjs/common';
import { Request } from 'express';
import { DomainError } from '@aeos/errors';
import { GetFileUrlHandler } from '../../application/queries/get-file-url/get-file-url.handler';
import { GetFileUrlQuery } from '../../application/queries/get-file-url/get-file-url.query';
import { GenerateSignatureHandler } from '../../application/queries/generate-signature/generate-signature.handler';
import { GenerateSignatureQuery } from '../../application/queries/generate-signature/generate-signature.query';
import { ConfirmUploadHandler } from '../../application/commands/confirm-upload/confirm-upload.handler';
import { ConfirmUploadCommand } from '../../application/commands/confirm-upload/confirm-upload.command';
import { ConfirmUploadDto } from '../dtos/confirm-upload.dto';

@Controller('files')
export class FileController {
  constructor(
    private readonly getFileUrlHandler: GetFileUrlHandler,
    private readonly generateSignatureHandler: GenerateSignatureHandler,
    private readonly confirmUploadHandler: ConfirmUploadHandler,
  ) {}

  @Get(':id/url')
  async getFileUrl(@Param('id') id: string) {
    const query = new GetFileUrlQuery(id);
    const result = await this.getFileUrlHandler.execute(query);
    if (result.isFail) throw result.error as DomainError;
    return { url: result.value };
  }

  @Get('signature')
  async generateSignature(@Req() req: Request, @Query('folder') folder?: string) {
    const folderType = folder || 'documents';
    const query = new GenerateSignatureQuery(folderType);
    const result = await this.generateSignatureHandler.execute(query);
    if (result.isFail) throw result.error as DomainError;
    return result.value;
  }

  @Post('confirm')
  async confirmUpload(@Body() body: ConfirmUploadDto, @Req() req: Request) {
    const user = (req as any).user;
    const command = new ConfirmUploadCommand(
      user.tenantId,
      user.userId,
      body.storageKey,
      body.fileName,
      body.mimeType,
      body.size,
      body.provider,
    );

    const result = await this.confirmUploadHandler.execute(command);
    if (result.isFail) throw result.error as DomainError;

    return { id: result.value, message: 'File confirmed successfully' };
  }
}
