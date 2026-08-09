import { IsString } from 'class-validator';

export class AcceptInviteRequestDto {
  @IsString() 
  token!: string;
}
