import { Controller, Post, Get, Patch, Body, Param, Query, Req, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { Request } from 'express';
import { DomainError } from '@aeos/errors';
import { CreateDocumentCommand } from '../../application/commands/create-document/create-document.command';
import { CreateDocumentHandler } from '../../application/commands/create-document/create-document.handler';
import { UpdateDocumentCommand } from '../../application/commands/update-document/update-document.command';
import { UpdateDocumentHandler } from '../../application/commands/update-document/update-document.handler';
import { PublishDocumentVersionCommand } from '../../application/commands/publish-document-version/publish-document-version.command';
import { PublishDocumentVersionHandler } from '../../application/commands/publish-document-version/publish-document-version.handler';
import { GetDocumentQuery } from '../../application/queries/get-document/get-document.query';
import { GetDocumentHandler } from '../../application/queries/get-document/get-document.handler';
import { DocumentRepository, DOCUMENT_REPOSITORY } from '../../domain/repositories/document.repository';
import { CreateDocumentRequestDto } from '../dto/create-document.request.dto';
import { UpdateDocumentRequestDto } from '../dto/update-document.request.dto';
import { PublishVersionRequestDto } from '../dto/publish-version.request.dto';

@Controller('documents')
export class DocumentController {
  constructor(
    private readonly createHandler: CreateDocumentHandler,
    private readonly updateHandler: UpdateDocumentHandler,
    private readonly publishVersionHandler: PublishDocumentVersionHandler,
    private readonly getDocumentHandler: GetDocumentHandler,
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: DocumentRepository,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateDocumentRequestDto, @Req() req: Request) {
    const user = (req as any).user;
    const command = new CreateDocumentCommand(
      dto.tenantId, dto.workspaceId, dto.name,
      user.userId, dto.visibility ?? 'PRIVATE',
    );
    const result = await this.createHandler.execute(command);
    if (result.isFail) throw result.error as DomainError;
    return { id: result.value, message: 'Document created.' };
  }

  @Get()
  async list(@Query('workspaceId') workspaceId: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    const p = parseInt(page ?? '1', 10);
    const l = parseInt(limit ?? '20', 10);
    const { data, total } = await this.documentRepository.findByWorkspaceId(workspaceId, p, l);
    return {
      data: data.map((d) => ({
        id: d.id, name: d.name, ownerId: d.ownerId, visibility: d.visibility,
        versionCount: d.versions.length, createdAt: d.createdAt,
      })),
      meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
    };
  }

  @Get(':id')
  async get(@Param('id') id: string, @Query('workspaceId') workspaceId: string) {
    const query = new GetDocumentQuery(id, workspaceId);
    const result = await this.getDocumentHandler.execute(query);
    if (result.isFail) throw result.error as DomainError;
    return result.value;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDocumentRequestDto) {
    const result = await this.updateHandler.execute(new UpdateDocumentCommand(id, dto.name, dto.visibility));
    if (result.isFail) throw result.error as DomainError;
    return { message: 'Document updated.' };
  }

  @Post(':id/versions')
  async publishVersion(@Param('id') id: string, @Body() dto: PublishVersionRequestDto) {
    const result = await this.publishVersionHandler.execute(new PublishDocumentVersionCommand(id, dto.fileId));
    if (result.isFail) throw result.error as DomainError;
    return { message: 'Document version published.' };
  }
}
