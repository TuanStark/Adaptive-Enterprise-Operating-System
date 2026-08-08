import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import * as jwt from 'jsonwebtoken';
import { Result } from '@aeos/errors';
import { ValidateWorkspaceInviteQuery } from './validate-workspace-invite.query';

export interface ValidateWorkspaceInviteResponse {
  email: string;
  workspaceId: string;
}

@QueryHandler(ValidateWorkspaceInviteQuery)
export class ValidateWorkspaceInviteHandler implements IQueryHandler<ValidateWorkspaceInviteQuery> {
  async execute(query: ValidateWorkspaceInviteQuery): Promise<Result<ValidateWorkspaceInviteResponse, Error>> {
    const secret = process.env.JWT_SECRET || 'fallback-dev-secret-min-32-chars!!';
    
    try {
      const decoded = jwt.verify(query.token, secret, { issuer: 'aeos-platform' }) as any;
      
      if (!decoded || !decoded.email || !decoded.workspaceId) {
        return Result.fail(new Error('Invalid token payload.'));
      }
      
      return Result.ok({
        email: decoded.email,
        workspaceId: decoded.workspaceId,
      });
    } catch (err: any) {
      // jwt.verify throws if token is expired, invalid signature, etc.
      return Result.fail(new Error(`Invalid or expired token: ${err.message}`));
    }
  }
}
