import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateDocumentRequestDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  visibility?: string;
}
