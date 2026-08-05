import { Controller, Post, Get, Body, Req, Query, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { Request } from 'express';
import { DomainError } from '@aeos/errors';
import { IsString, IsOptional, MaxLength, MinLength, IsDateString } from 'class-validator';
import { CreateMeetingCommand } from '../../application/commands/create-meeting/create-meeting.command';
import { CreateMeetingHandler } from '../../application/commands/create-meeting/create-meeting.handler';
import { MeetingRepository, MEETING_REPOSITORY } from '../../domain/repositories/meeting.repository';

class CreateMeetingRequestDto {
  @IsString() tenantId!: string;
  @IsString() workspaceId!: string;
  @IsString() @MinLength(1) @MaxLength(255) title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsDateString() startTime?: string;
  @IsOptional() @IsDateString() endTime?: string;
  @IsOptional() @IsString() meetingUrl?: string;
}

@Controller('meetings')
export class MeetingController {
  constructor(
    private readonly createHandler: CreateMeetingHandler,
    @Inject(MEETING_REPOSITORY)
    private readonly meetingRepository: MeetingRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMeetingRequestDto, @Req() req: Request) {
    const user = (req as any).user;
    const command = new CreateMeetingCommand(
      dto.tenantId, dto.workspaceId, dto.title, user.userId,
      dto.description, 
      dto.startTime ? new Date(dto.startTime) : undefined,
      dto.endTime ? new Date(dto.endTime) : undefined,
      dto.meetingUrl,
    );
    const result = await this.createHandler.execute(command);
    if (result.isFail) throw result.error as DomainError;
    return { id: result.value, message: 'Meeting created.' };
  }

  @Get()
  async list(@Query('workspaceId') workspaceId: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    const p = parseInt(page ?? '1', 10);
    const l = parseInt(limit ?? '20', 10);
    const { data, total } = await this.meetingRepository.findByWorkspaceId(workspaceId, p, l);
    return {
      data: data.map((m) => ({
        id: m.id, title: m.title, startTime: m.startTime, endTime: m.endTime,
        organizerId: m.organizerId, participants: m.participants.length,
        meetingUrl: m.meetingUrl
      })),
      meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
    };
  }
}
