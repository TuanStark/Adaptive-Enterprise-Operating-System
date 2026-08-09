import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { Result, DomainError, ValidationError } from '@aeos/errors';
import { GetWorkspaceBurndownQuery } from './get-workspace-burndown.query';

@Injectable()
export class GetWorkspaceBurndownHandler {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetWorkspaceBurndownQuery): Promise<Result<any, DomainError>> {
    const { workspaceId } = query;

    try {
      const activeSprint = await this.prisma.sprint.findFirst({
        where: {
          project: {
            workspaceId,
          },
          status: 'ACTIVE',
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          tasks: true,
        },
      });

      if (!activeSprint || !activeSprint.startDate || !activeSprint.endDate) {
        return this.generateFallbackBurndown(workspaceId);
      }

      const startDate = new Date(activeSprint.startDate);
      const endDate = new Date(activeSprint.endDate);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

      const sprintDuration = totalDays > 0 ? totalDays : 10;
      const totalTasks = activeSprint.tasks.length;

      const idealDecrease = totalTasks / sprintDuration;

      const burndownData = [];

      for (let i = 0; i <= sprintDuration; i++) {
        const currentDay = new Date(startDate);
        currentDay.setDate(startDate.getDate() + i);

        let ideal = Math.max(0, Math.round(totalTasks - idealDecrease * i));

        let remaining = 0;

        activeSprint.tasks.forEach((task) => {
          const taskCreatedAt = new Date(task.createdAt);
          if (taskCreatedAt <= currentDay) {
            if (task.status !== 'DONE') {
              remaining++;
            } else if (task.updatedAt > currentDay) {
              remaining++;
            }
          }
        });
        const now = new Date();
        const isFuture = currentDay > now && currentDay.getDate() !== now.getDate();

        burndownData.push({
          day: `Day ${i + 1}`,
          ideal: ideal,
          remaining: isFuture ? null : remaining,
        });
      }

      return Result.ok(burndownData);
    } catch (error) {
      return Result.fail(new ValidationError('Failed to fetch burndown data'));
    }
  }

  private async generateFallbackBurndown(workspaceId: string): Promise<Result<any, DomainError>> {
    const burndownData = [];
    const totalDays = 10;
    const now = new Date();

    try {
      const createdCounts = await this.prisma.$queryRaw<{ date: Date; count: bigint }[]>`
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM tasks 
        WHERE workspace_id = ${workspaceId}::uuid
        GROUP BY DATE(created_at)
      `;

      const completedCounts = await this.prisma.$queryRaw<{ date: Date; count: bigint }[]>`
        SELECT DATE(updated_at) as date, COUNT(*) as count 
        FROM tasks 
        WHERE workspace_id = ${workspaceId}::uuid AND status = 'DONE'
        GROUP BY DATE(updated_at)
      `;

      // Calculate totalTasksCount
      let totalTasksCount = 0;
      for (const c of createdCounts) {
        totalTasksCount += Number(c.count);
      }

      const idealDecrease = totalTasksCount / totalDays;

      for (let i = 0; i <= totalDays; i++) {
        const currentDay = new Date();
        currentDay.setDate(now.getDate() - (totalDays - i));
        currentDay.setHours(23, 59, 59, 999);

        let ideal = Math.max(0, Math.round(totalTasksCount - idealDecrease * i));

        let cumulativeCreated = 0;
        let cumulativeCompleted = 0;

        for (const c of createdCounts) {
          if (c.date <= currentDay) {
            cumulativeCreated += Number(c.count);
          }
        }

        for (const c of completedCounts) {
          if (c.date <= currentDay) {
            cumulativeCompleted += Number(c.count);
          }
        }

        let remaining = cumulativeCreated - cumulativeCompleted;

        burndownData.push({
          day: `Day ${i + 1}`,
          ideal: ideal,
          remaining: remaining,
        });
      }

      return Result.ok(burndownData);
    } catch (error) {
      console.error(error);
      return Result.fail(new ValidationError('Failed to calculate fallback burndown'));
    }
  }
}
