import { IsString, IsOptional, MaxLength, MinLength, IsNumber, IsArray } from 'class-validator';

export class CreateTaskRequestDto {
  @IsString() tenantId!: string;
  @IsString() workspaceId!: string;
  @IsString() projectId!: string;
  @IsString() @MinLength(1) @MaxLength(255) title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsNumber() storyPoints?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) labels?: string[];
}
