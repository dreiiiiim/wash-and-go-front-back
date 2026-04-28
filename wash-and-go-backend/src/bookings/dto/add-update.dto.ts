import { IsArray, IsOptional, IsString } from 'class-validator';

export class AddUpdateDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}
