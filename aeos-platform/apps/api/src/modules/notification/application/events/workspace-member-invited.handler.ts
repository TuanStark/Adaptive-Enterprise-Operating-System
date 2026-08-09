import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { WorkspaceMemberInvitedIntegrationEvent } from '../../../../common/contracts/workspace.contract';
import {
  IMailService,
  MAIL_SERVICE,
} from '../../../../common/mail/application/ports/mail.service.interface';
import {
  GetUsersInternalQuery,
  UserInternalDto,
} from '../../../../common/contracts/identity.contract';
import {
  GetWorkspaceInternalQuery,
  WorkspaceInternalDto,
} from '../../../../common/contracts/workspace.contract';
import * as jwt from 'jsonwebtoken';

@Injectable()
@EventsHandler(WorkspaceMemberInvitedIntegrationEvent)
export class WorkspaceMemberInvitedNotificationHandler implements IEventHandler<WorkspaceMemberInvitedIntegrationEvent> {
  private readonly logger = new Logger(WorkspaceMemberInvitedNotificationHandler.name);

  constructor(
    private readonly queryBus: QueryBus,
    @Inject(MAIL_SERVICE)
    private readonly mailService: IMailService,
  ) {}

  async handle(event: WorkspaceMemberInvitedIntegrationEvent): Promise<void> {
    this.logger.log(`Handling WorkspaceMemberInvitedEvent for email: ${event.email}`);

    // Fetch details using QueryBus to avoid direct imports
    const users: UserInternalDto[] = await this.queryBus.execute(
      new GetUsersInternalQuery([event.inviterId]),
    );
    const inviter = users[0];
    const inviterName = inviter ? `${inviter.firstName} ${inviter.lastName}`.trim() : 'Someone';

    const workspace: WorkspaceInternalDto | null = await this.queryBus.execute(
      new GetWorkspaceInternalQuery(event.workspaceId),
    );
    const workspaceName = workspace?.name || 'A Workspace';

    const secret = process.env.JWT_SECRET || 'fallback-dev-secret-min-32-chars!!';
    const token = jwt.sign(
      { email: event.email, workspaceId: event.workspaceId, inviterId: event.inviterId },
      secret,
      { expiresIn: '7d', issuer: 'aeos-platform' },
    );

    const frontendUrl = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:3000';
    const inviteUrl = `${frontendUrl}/invite?token=${token}`;

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
