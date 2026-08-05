import { IsString } from 'class-validator';

export class ChangeStatusRequestDto {
  @IsString() status!: string;
}
