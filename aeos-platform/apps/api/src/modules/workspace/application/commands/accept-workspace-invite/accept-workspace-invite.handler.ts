import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import * as jwt from 'jsonwebtoken';
import { Result, DomainError, NotFoundError } from '@aeos/errors';
import { WorkspaceRepository, WORKSPACE_REPOSITORY } from '../../../domain/repositories/workspace.repository';
import { AcceptWorkspaceInviteCommand } from './accept-workspace-invite.command';
import { GetUsersInternalQuery, UserInternalDto } from '../../../../../common/contracts/identity.contract';

@CommandHandler(AcceptWorkspaceInviteCommand)
export class AcceptWorkspaceInviteHandler implements ICommandHandler<AcceptWorkspaceInviteCommand> {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: AcceptWorkspaceInviteCommand): Promise<Result<void, DomainError>> {
    const secret = process.env.JWT_SECRET || 'fallback-dev-secret-min-32-chars!!';
    
    let decoded: any;
    try {
      decoded = jwt.verify(command.token, secret, { issuer: 'aeos-platform' });
    } catch (err) {
      return Result.fail({
        code: 'INVALID_INVITE_TOKEN',
        message: 'The invitation link is invalid or has expired.',
        httpStatus: 400,
        toJSON: () => ({ code: 'INVALID_INVITE_TOKEN', message: 'The invitation link is invalid or has expired.' }),
      });
    }

    const { email: invitedEmail, workspaceId } = decoded;

    // Verify current user's email matches the invited email
    const users: UserInternalDto[] = await this.queryBus.execute(new GetUsersInternalQuery([command.currentUserId]));
    const currentUser = users[0];

    if (!currentUser || currentUser.email !== invitedEmail) {
      return Result.fail({
        code: 'EMAIL_MISMATCH',
        message: 'This invitation was sent to a different email address.',
        httpStatus: 403,
        toJSON: () => ({ code: 'EMAIL_MISMATCH', message: 'This invitation was sent to a different email address.' }),
      });
    }

    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      return Result.fail(new NotFoundError('Workspace', workspaceId));
    }

    const addResult = workspace.addMember(workspace.tenantId, currentUser.id, null);
    if (addResult.isFail) {
      return Result.fail({
        code: 'ADD_MEMBER_FAILED',
        message: addResult.error.message,
        httpStatus: 400,
        toJSON: () => ({ code: 'ADD_MEMBER_FAILED', message: addResult.error.message }),
      });
    }

    await this.workspaceRepository.save(workspace);
    return Result.ok(undefined);
  }
}
