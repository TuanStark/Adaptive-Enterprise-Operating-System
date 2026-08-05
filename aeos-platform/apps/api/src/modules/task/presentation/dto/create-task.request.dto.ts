import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateTaskRequestDto {
  @IsString() tenantId!: string;
  @IsString() projectId!: string;
  @IsString() @MinLength(1) @MaxLength(255) title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() storyPoints?: number;
}
