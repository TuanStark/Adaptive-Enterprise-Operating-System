import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { DomainError } from '@aeos/errors';
import { IsString, IsArray, IsOptional, MaxLength, MinLength, IsIn } from 'class-validator';
import { CreateApprovalCommand } from '../../application/commands/create-approval/create-approval.command';
import { CreateApprovalHandler } from '../../application/commands/create-approval/create-approval.handler';
import {
  ProcessApprovalCommand,
  ProcessApprovalHandler,
} from '../../application/commands/process-approval/process-approval.handler';
import {
  ApprovalRepository,
  APPROVAL_REPOSITORY,
} from '../../domain/repositories/approval.repository';

class CreateApprovalRequestDto {
  @IsString() tenantId!: string;
  @IsString() workspaceId!: string;
  @IsString() @MinLength(1) @MaxLength(255) title!: string;
  @IsString() entityType!: string;
  @IsString() entityId!: string;
  @IsArray() @IsString({ each: true }) reviewerIds!: string[];
}

class ProcessApprovalRequestDto {
  @IsString() @IsIn(['APPROVE', 'REJECT']) action!: 'APPROVE' | 'REJECT';
  @IsOptional() @IsString() comment?: string;
}

@Controller('approvals')
export class ApprovalController {
  constructor(
    private readonly createHandler: CreateApprovalHandler,
    private readonly processHandler: ProcessApprovalHandler,
    @Inject(APPROVAL_REPOSITORY)
    private readonly approvalRepository: ApprovalRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateApprovalRequestDto, @Req() req: Request) {
    const user = (req as any).user;
    const command = new CreateApprovalCommand(
      dto.tenantId,
      dto.workspaceId,
      user.userId,
      dto.title,
      dto.entityType,
      dto.entityId,
      dto.reviewerIds,
    );
    const result = await this.createHandler.execute(command);
    if (result.isFail) throw result.error as DomainError;
    return { id: result.value, message: 'Approval request created.' };
  }

  @Get()
  async list(
    @Query('workspaceId') workspaceId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = parseInt(page ?? '1', 10);
    const l = parseInt(limit ?? '20', 10);
    const { data, total } = await this.approvalRepository.findByWorkspaceId(workspaceId, p, l);
    return {
      data: data.map((a) => ({
        id: a.id,
        title: a.title,
        status: a.status,
        requesterId: a.requesterId,
        steps: a.steps.map((s) => ({
          reviewerId: s.reviewerId,
          status: s.status,
          comment: s.comment,
        })),
        createdAt: a.createdAt,
      })),
      meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
    };
  }

  @Patch(':id/process')
  async process(
    @Param('id') id: string,
    @Body() dto: ProcessApprovalRequestDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    const result = await this.processHandler.execute(
      new ProcessApprovalCommand(id, user.userId, dto.action, dto.comment),
    );
    if (result.isFail) throw result.error as DomainError;
    return { message: 'Approval processed.' };
  }
}
