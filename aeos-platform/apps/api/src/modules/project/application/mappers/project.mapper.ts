import { Project } from '../../domain/aggregates/project.aggregate';
import { ProjectResponseDto } from '../dto/project-response.dto';

export class ProjectMapper {
  static toDto(project: Project): ProjectResponseDto {
    return new ProjectResponseDto(
      project.id, project.tenantId, project.workspaceId, project.name,
      project.description, project.ownerId, project.status, project.priority,
      project.startDate, project.endDate, project.members.length, project.createdAt,
    );
  }
}
