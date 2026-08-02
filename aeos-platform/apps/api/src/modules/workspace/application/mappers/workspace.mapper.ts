import { Workspace } from '../../domain/aggregates/workspace.aggregate';
import { WorkspaceResponseDto } from '../dto/workspace-response.dto';

export class WorkspaceMapper {
  static toDto(ws: Workspace): WorkspaceResponseDto {
    return new WorkspaceResponseDto(
      ws.id,
      ws.tenantId,
      ws.organizationId,
      ws.name,
      ws.description,
      ws.ownerId,
      ws.status,
      ws.members.length,
      ws.createdAt,
    );
  }
}
