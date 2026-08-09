import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs';
import * as jwt from 'jsonwebtoken';
import { Result } from '@aeos/errors';
import { ValidateWorkspaceInviteQuery } from './validate-workspace-invite.query';
import { WorkspaceRepository, WORKSPACE_REPOSITORY } from '../../../domain/repositories/workspace.repository';
import { WorkspaceStatus } from '../../../domain/aggregates/workspace.aggregate';
import { GetUsersInternalQuery, UserInternalDto } from '../../../../../common/contracts/identity.contract';

export interface ValidateWorkspaceInviteResponse {
  email: string;
  workspaceId: string;
  workspaceName: string;
  inviterName?: string;
  tenantId?: string;
}

interface InviteJwtPayload {
  email?: string;
  workspaceId?: string;
  inviterId?: string;
  iss?: string;
}

@Injectable()
@QueryHandler(ValidateWorkspaceInviteQuery)
export class ValidateWorkspaceInviteHandler implements IQueryHandler<ValidateWorkspaceInviteQuery> {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(query: ValidateWorkspaceInviteQuery): Promise<Result<ValidateWorkspaceInviteResponse, Error>> {
    const secret = process.env.JWT_SECRET || 'fallback-dev-secret-min-32-chars!!';
    
    try {
      const decoded = jwt.verify(query.token, secret, { issuer: 'aeos-platform' }) as InviteJwtPayload;
      
      if (!decoded || !decoded.email || !decoded.workspaceId) {
        return Result.fail(new Error('Invalid invitation token payload.'));
      }

      // Verify workspace existence and active status
      const workspace = await this.workspaceRepository.findById(decoded.workspaceId);
      if (!workspace) {
        return Result.fail(new Error('The invited workspace no longer exists.'));
      }

      if (workspace.status === WorkspaceStatus.ARCHIVED) {
        return Result.fail(new Error('This workspace has been archived and cannot accept new members.'));
      }

      let inviterName: string | undefined;
      if (decoded.inviterId) {
        try {
          const users: UserInternalDto[] = await this.queryBus.execute(new GetUsersInternalQuery([decoded.inviterId]));
          const inviter = users?.[0];
          if (inviter) {
            inviterName = `${inviter.firstName ?? ''} ${inviter.lastName ?? ''}`.trim() || undefined;
          }
        } catch {
          // Non-critical: failure to fetch inviter details shouldn't block invite validation
        }
      }
      
      return Result.ok({
        email: decoded.email,
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        inviterName,
        tenantId: workspace.tenantId,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown token validation error';
      return Result.fail(new Error(`Invalid or expired token: ${errorMessage}`));
    }
  }
}


