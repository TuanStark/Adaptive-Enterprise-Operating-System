import { IsString, IsOptional, MaxLength, MinLength, IsNumber, IsDateString } from 'class-validator';

export class UpdateTaskRequestDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(255) title?: string;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsNumber() storyPoints?: number | null;
  @IsOptional() @IsDateString() dueDate?: string | null;
}
