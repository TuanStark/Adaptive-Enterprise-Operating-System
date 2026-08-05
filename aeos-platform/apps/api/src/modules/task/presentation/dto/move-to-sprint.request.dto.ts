import { IsOptional, IsString } from 'class-validator';

export class MoveToSprintRequestDto {
  @IsOptional() @IsString() sprintId?: string;
}
