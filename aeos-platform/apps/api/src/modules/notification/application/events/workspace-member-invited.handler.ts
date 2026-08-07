import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { WorkspaceMemberInvitedEvent } from '../../../workspace/domain/events/workspace-member-invited.event';
import { IMailService, MAIL_SERVICE } from '../../../../common/mail/application/ports/mail.service.interface';
import { GetUsersInternalQuery, UserInternalDto } from '../../../../common/contracts/identity.contract';
import { GetWorkspaceInternalQuery, WorkspaceInternalDto } from '../../../../common/contracts/workspace.contract';

@Injectable()
@EventsHandler(WorkspaceMemberInvitedEvent)
export class WorkspaceMemberInvitedNotificationHandler implements IEventHandler<WorkspaceMemberInvitedEvent> {
  private readonly logger = new Logger(WorkspaceMemberInvitedNotificationHandler.name);

  constructor(
    @Inject(MAIL_SERVICE)
    private readonly mailService: IMailService,
    private readonly queryBus: QueryBus,
  ) {}

  async handle(event: WorkspaceMemberInvitedEvent) {
    this.logger.log(`Handling WorkspaceMemberInvitedEvent for email: ${event.email}`);

    // Fetch details using QueryBus to avoid direct imports
    const users: UserInternalDto[] = await this.queryBus.execute(new GetUsersInternalQuery([event.inviterId]));
    const inviter = users[0];
    const inviterName = inviter ? `${inviter.firstName} ${inviter.lastName}`.trim() : 'Someone';

    const workspace: WorkspaceInternalDto | null = await this.queryBus.execute(new GetWorkspaceInternalQuery(event.workspaceId));
    const workspaceName = workspace?.name || 'A Workspace';

    const inviteUrl = `http://localhost:3000/invite?workspaceId=${event.workspaceId}`;

    await this.mailService.sendTemplateEmail({
      to: event.email,
      subject: `You have been invited to join ${workspaceName} on AEOS`,
      template: 'invite-member',
      context: {
        inviterName,
        workspaceName,
        inviteUrl,
      },
    });
  }
}
