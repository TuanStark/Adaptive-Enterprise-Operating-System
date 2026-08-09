import { IsString, IsOptional } from 'class-validator';

export class UpdateWorkspaceMemberProfileDto {
  @IsOptional()
  @IsString()
  nickname?: string | null;

  @IsOptional()
  @IsString()
  avatarUrl?: string | null;

  @IsOptional()
  @IsString()
  title?: string | null;

  @IsOptional()
  @IsString()
  department?: string | null;

  @IsOptional()
  @IsString()
  statusMessage?: string | null;
}
