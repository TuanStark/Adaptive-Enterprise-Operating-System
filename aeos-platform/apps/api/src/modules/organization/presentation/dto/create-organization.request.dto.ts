import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateOrganizationRequestDto {
  @IsString()
  tenantId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;
}
