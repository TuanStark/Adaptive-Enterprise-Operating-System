import { Controller, Get, Patch, Param, Query, Req, Inject } from '@nestjs/common';
import { Request } from 'express';
import { DomainError } from '@aeos/errors';
import { MarkAsReadCommand, MarkAsReadHandler } from '../../application/commands/mark-as-read/mark-as-read.handler';
import { MarkAllAsReadCommand, MarkAllAsReadHandler } from '../../application/commands/mark-all-as-read/mark-all-as-read.handler';
import { NotificationRepository, NOTIFICATION_REPOSITORY } from '../../domain/repositories/notification.repository';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly markAsReadHandler: MarkAsReadHandler,
    private readonly markAllAsReadHandler: MarkAllAsReadHandler,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  @Get()
  async list(@Req() req: Request, @Query('page') page?: string, @Query('limit') limit?: string) {
    const user = (req as any).user;
    const p = parseInt(page ?? '1', 10);
    const l = parseInt(limit ?? '20', 10);

    const { data, total } = await this.notificationRepository.findByUserId(user.userId, p, l);
    return {
      data: data.map((n) => ({
        id: n.id, type: n.type, title: n.title, content: n.content,
        read: n.read, metadata: n.metadata, createdAt: n.createdAt,
      })),
      meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
    };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    const result = await this.markAsReadHandler.execute(new MarkAsReadCommand(id));
    if (result.isFail) throw result.error as DomainError;
    return { message: 'Notification marked as read.' };
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: Request) {
    const user = (req as any).user;
    const result = await this.markAllAsReadHandler.execute(new MarkAllAsReadCommand(user.userId));
    if (result.isFail) throw result.error as DomainError;
    return { message: 'All notifications marked as read.' };
  }
}
