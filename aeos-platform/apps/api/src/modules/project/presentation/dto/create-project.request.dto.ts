import { IsString, MaxLength, MinLength, IsOptional } from 'class-validator';

export class CreateProjectRequestDto {
  @IsString()
  tenantId!: string;

  @IsString()
  workspaceId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  priority?: string;
}
