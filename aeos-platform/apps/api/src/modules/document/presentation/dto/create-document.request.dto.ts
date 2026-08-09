import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateDocumentRequestDto {
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
  visibility?: string;
}
