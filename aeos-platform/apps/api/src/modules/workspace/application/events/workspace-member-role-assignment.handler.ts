import { Injectable, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PrismaService } from '@aeos/database';
import { WorkspaceMemberAddedIntegrationEvent } from '../../../../common/contracts/workspace.contract';

@EventsHandler(WorkspaceMemberAddedIntegrationEvent)
@Injectable()
export class WorkspaceMemberRoleAssignmentHandler implements IEventHandler<WorkspaceMemberAddedIntegrationEvent> {
  private readonly logger = new Logger(WorkspaceMemberRoleAssignmentHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async handle(event: WorkspaceMemberAddedIntegrationEvent): Promise<void> {
    const { workspaceId, memberId } = event;
    if (!workspaceId) return;

    try {
      // 1. Fetch workspace to determine owner
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { tenantId: true, ownerId: true },
      });
      if (!workspace) return;

      // 2. Ensure default roles (OWNER, MEMBER) exist in DB
      let ownerRole = await this.prisma.role.findFirst({
        where: { workspaceId, name: 'OWNER' },
      });
      if (!ownerRole) {
        ownerRole = await this.prisma.role.create({
          data: {
            tenantId: workspace.tenantId,
            workspaceId,
            name: 'OWNER',
            description: 'Workspace Owner with full privileges',
          },
        });
      }

      let memberRole = await this.prisma.role.findFirst({
        where: { workspaceId, name: 'MEMBER' },
      });
      if (!memberRole) {
        memberRole = await this.prisma.role.create({
          data: {
            tenantId: workspace.tenantId,
            workspaceId,
            name: 'MEMBER',
            description: 'Standard workspace member',
          },
        });
      }

      // 3. Assign role to target member if roleId is null
      if (memberId) {
        const memberRecord = await this.prisma.workspaceMember.findFirst({
          where: { workspaceId, userId: memberId },
        });

        if (memberRecord && !memberRecord.roleId) {
          const targetRoleId = memberId === workspace.ownerId ? ownerRole.id : memberRole.id;
          await this.prisma.workspaceMember.update({
            where: { id: memberRecord.id },
            data: { roleId: targetRoleId },
          });
          this.logger.log(
            `Assigned roleId ${targetRoleId} to user ${memberId} in workspace ${workspaceId}`,
          );
        }
      }
    } catch (err) {
      this.logger.error(
        `Failed to assign default role for member ${memberId} in workspace ${workspaceId}:`,
        err,
      );
    }
  }
}
