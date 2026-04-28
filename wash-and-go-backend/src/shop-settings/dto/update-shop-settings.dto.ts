import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateShopSettingsDto {
  @IsString()
  open_time: string;

  @IsString()
  close_time: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;
}
