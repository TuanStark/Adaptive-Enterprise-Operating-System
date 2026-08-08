import { Controller, Post, Get, Param, UseInterceptors, UploadedFile, Req, ParseFilePipe, MaxFileSizeValidator } from '@nestjs/common';
import 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { DomainError } from '@aeos/errors';
import { UploadFileCommand } from '../../application/commands/upload-file/upload-file.command';
import { UploadFileHandler } from '../../application/commands/upload-file/upload-file.handler';
import { GetFileUrlHandler } from '../../application/queries/get-file-url/get-file-url.handler';
import { GetFileUrlQuery } from '../../application/queries/get-file-url/get-file-url.query';


@Controller('files')
export class FileController {
  constructor(
    private readonly uploadFileHandler: UploadFileHandler,
    private readonly getFileUrlHandler: GetFileUrlHandler,
  ) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })], // 10MB limit
      }),
    )
    file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const user = (req as any).user;

    const command = new UploadFileCommand(
      user.tenantId,
      user.userId,
      file.buffer,
      file.originalname,
      file.mimetype,
      file.size,
    );

    const result = await this.uploadFileHandler.execute(command);
    if (result.isFail) throw result.error as DomainError;

    return { id: result.value, message: 'File uploaded successfully' };
  }

  @Get(':id/url')
  async getFileUrl(@Param('id') id: string) {
    const query = new GetFileUrlQuery(id);
    const result = await this.getFileUrlHandler.execute(query);
    if (result.isFail) throw result.error as DomainError;
    return { url: result.value };
  }
}
