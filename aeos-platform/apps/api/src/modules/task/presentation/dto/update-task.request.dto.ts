import { IsString, IsOptional, MaxLength, MinLength, IsNumber, IsDateString, IsArray } from 'class-validator';

export class UpdateTaskRequestDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(255) title?: string;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsNumber() storyPoints?: number | null;
  @IsOptional() @IsDateString() dueDate?: string | null;
  @IsOptional() @IsDateString() startDate?: string | null;
  @IsOptional() @IsString() resolution?: string | null;
  @IsOptional() @IsArray() @IsString({ each: true }) labels?: string[];
  @IsOptional() @IsString() environment?: string | null;
  @IsOptional() @IsString() fixVersionId?: string | null;
  @IsOptional() @IsString() reporterId?: string | null;
  @IsOptional() @IsNumber() originalEstimate?: number | null;
}
