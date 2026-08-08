import { IsString, IsNumber } from 'class-validator';

export class ConfirmUploadDto {
  @IsString() storageKey!: string;
  @IsString() fileName!: string;
  @IsString() mimeType!: string;
  @IsNumber() size!: number;
  @IsString() provider!: string;
}
