import { IsString, IsEmail } from 'class-validator';

export class InviteMemberRequestDto {
  @IsString()
  @IsEmail()
  email!: string;
}
