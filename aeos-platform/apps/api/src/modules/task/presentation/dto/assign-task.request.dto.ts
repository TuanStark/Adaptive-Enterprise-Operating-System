import { IsString } from 'class-validator';

export class AssignTaskRequestDto {
  @IsString() assigneeId!: string;
}
