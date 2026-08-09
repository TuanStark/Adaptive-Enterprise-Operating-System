import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { WorkspaceArchivedEvent } from '../../../workspace/domain/events/workspace-archived.event';
import { WorkspaceMemberRemovedEvent } from '../../../workspace/domain/events/workspace-member.events';
import { ChatGateway } from '../../presentation/gateways/chat.gateway';

@EventsHandler(WorkspaceArchivedEvent)
export class WorkspaceArchivedEventHandler implements IEventHandler<WorkspaceArchivedEvent> {
  constructor(private readonly chatGateway: ChatGateway) {}

  handle(event: WorkspaceArchivedEvent) {
    console.log(`[MessageModule] Handling WorkspaceArchivedEvent for workspace ${event.workspaceId}`);
    this.chatGateway.broadcastWorkspaceArchived(event.workspaceId);
  }
}

@EventsHandler(WorkspaceMemberRemovedEvent)
export class WorkspaceMemberRemovedEventHandler implements IEventHandler<WorkspaceMemberRemovedEvent> {
  constructor(private readonly chatGateway: ChatGateway) {}

  handle(event: WorkspaceMemberRemovedEvent) {
    console.log(`[MessageModule] Handling WorkspaceMemberRemovedEvent for user ${event.memberId} in workspace ${event.workspaceId}`);
    this.chatGateway.broadcastWorkspaceMemberRemoved(event.workspaceId, event.memberId);
  }
}
