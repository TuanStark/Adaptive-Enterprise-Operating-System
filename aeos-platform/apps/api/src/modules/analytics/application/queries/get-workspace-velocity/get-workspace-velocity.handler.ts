import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { Result, DomainError, ValidationError } from '@aeos/errors';
import { GetWorkspaceVelocityQuery } from './get-workspace-velocity.query';

@Injectable()
export class GetWorkspaceVelocityHandler {
  constructor(private readonly prisma: PrismaService) { }

  async execute(query: GetWorkspaceVelocityQuery): Promise<Result<any, DomainError>> {
    const { workspaceId } = query;
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    try {
      const createdTasksCounts = await this.prisma.$queryRaw<
        { date: Date; count: bigint }[]
      >`
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM tasks 
        WHERE workspace_id = ${workspaceId}::uuid AND created_at >= ${sevenDaysAgo}
        GROUP BY DATE(created_at)
      `;

      const completedTasksCounts = await this.prisma.$queryRaw<
        { date: Date; count: bigint }[]
      >`
        SELECT DATE(updated_at) as date, COUNT(*) as count 
        FROM tasks 
        WHERE workspace_id = ${workspaceId}::uuid AND status = 'DONE' AND updated_at >= ${sevenDaysAgo}
        GROUP BY DATE(updated_at)
      `;

      // Group by day
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      const velocityData = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(sevenDaysAgo.getDate() + i);

        const dayStr = days[d.getDay()]; // Simple format, could be localized

        // Find the count for this specific day
        const createdCount = createdTasksCounts.find(
          c => c.date.getDate() === d.getDate() && c.date.getMonth() === d.getMonth()
        );
        const completedCount = completedTasksCounts.find(
          c => c.date.getDate() === d.getDate() && c.date.getMonth() === d.getMonth()
        );

        velocityData.push({
          name: dayStr,
          tasks: createdCount ? Number(createdCount.count) : 0,
          completed: completedCount ? Number(completedCount.count) : 0,
        });
      }

      return Result.ok(velocityData);
    } catch (error) {
      console.error(error);
      return Result.fail(new ValidationError('Failed to fetch velocity data'));
    }
  }
}
