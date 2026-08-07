import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PrismaService } from '@aeos/database';
import { IIntegrationEvent } from '@aeos/shared-kernel';
import {
  ProjectCreatedIntegrationEvent,
  ProjectDeletedIntegrationEvent,
} from '../../../../common/contracts/project.contract';
import {
  TaskCreatedIntegrationEvent,
  TaskDeletedIntegrationEvent,
} from '../../../../common/contracts/task.contract';
import {
  DocumentCreatedIntegrationEvent,
  DocumentDeletedIntegrationEvent,
} from '../../../../common/contracts/document.contract';
import {
  FormCreatedIntegrationEvent,
  FormDeletedIntegrationEvent,
} from '../../../../common/contracts/form.contract';
import {
  ApprovalCreatedIntegrationEvent,
  ApprovalDeletedIntegrationEvent,
} from '../../../../common/contracts/approval.contract';
import {
  CommentCreatedIntegrationEvent,
  CommentDeletedIntegrationEvent,
} from '../../../../common/contracts/comment.contract';
import {
  WorkspaceMemberAddedIntegrationEvent,
  WorkspaceMemberRemovedIntegrationEvent,
} from '../../../../common/contracts/workspace.contract';

@EventsHandler(
  ProjectCreatedIntegrationEvent, ProjectDeletedIntegrationEvent,
  TaskCreatedIntegrationEvent, TaskDeletedIntegrationEvent,
  DocumentCreatedIntegrationEvent, DocumentDeletedIntegrationEvent,
  FormCreatedIntegrationEvent, FormDeletedIntegrationEvent,
  ApprovalCreatedIntegrationEvent, ApprovalDeletedIntegrationEvent,
  CommentCreatedIntegrationEvent, CommentDeletedIntegrationEvent,
  WorkspaceMemberAddedIntegrationEvent, WorkspaceMemberRemovedIntegrationEvent,
)
@Injectable()
export class WorkspaceAnalyticsProjectionHandler implements IEventHandler<any> {
  constructor(private readonly prisma: PrismaService) {}

  async handle(event: any) {
    if (!event.workspaceId) return;
    const eventType = event.constructor.EVENT_TYPE || event.constructor.name;

    let updates: Record<string, number> = {};

    switch (eventType) {
      case 'ProjectCreatedEvent':
        updates = { totalProjects: 1, activeProjects: 1 };
        break;
      case 'ProjectDeletedEvent':
        updates = { totalProjects: -1, activeProjects: -1 };
        break;
      case 'TaskCreatedIntegrationEvent':
        updates = { totalTasks: 1, pendingTasks: 1 };
        break;
      case 'TaskDeletedEvent':
        updates = { totalTasks: -1, pendingTasks: -1 };
        break;
      case 'DocumentCreatedEvent':
        updates = { totalDocuments: 1 };
        break;
      case 'DocumentDeletedEvent':
        updates = { totalDocuments: -1 };
        break;
      case 'FormCreatedEvent':
        updates = { totalForms: 1 };
        break;
      case 'FormDeletedEvent':
        updates = { totalForms: -1 };
        break;
      case 'ApprovalCreatedEvent':
        updates = { totalApprovals: 1 };
        break;
      case 'ApprovalDeletedEvent':
        updates = { totalApprovals: -1 };
        break;
      case 'CommentCreatedEvent':
        updates = { totalComments: 1 };
        break;
      case 'CommentDeletedEvent':
        updates = { totalComments: -1 };
        break;
      case 'WorkspaceMemberAddedEvent':
        updates = { totalUsers: 1 };
        break;
      case 'WorkspaceMemberRemovedEvent':
        updates = { totalUsers: -1 };
        break;
      default:
        // Not interested in this event
        return;
    }

    try {
      // Build Prisma update / create object dynamically
      const createObj: Record<string, any> = { workspaceId: event.workspaceId };
      const updateObj: Record<string, any> = {};

      for (const [key, delta] of Object.entries(updates)) {
        createObj[key] = delta > 0 ? delta : 0;
        updateObj[key] = { increment: delta };
      }

      await this.prisma.workspaceAnalytics.upsert({
        where: { workspaceId: event.workspaceId },
        create: createObj as any,
        update: updateObj,
      });
    } catch (error) {
      console.error(`Failed to update analytics projection for workspace ${event.workspaceId}:`, error);
    }
  }
}
