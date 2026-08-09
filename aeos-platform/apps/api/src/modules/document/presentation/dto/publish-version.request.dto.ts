import { IsString } from 'class-validator';

export class PublishVersionRequestDto {
  @IsString()
  fileId!: string;
}
