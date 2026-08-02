import { IsString, MaxLength, MinLength, IsOptional } from 'class-validator';

export class CreateWorkspaceRequestDto {
  @IsString()
  tenantId!: string;

  @IsString()
  organizationId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
