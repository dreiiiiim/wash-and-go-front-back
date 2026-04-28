import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price_small?: number;

  @IsOptional()
  @IsNumber()
  price_medium?: number;

  @IsOptional()
  @IsNumber()
  price_large?: number;

  @IsOptional()
  @IsNumber()
  price_extra_large?: number;

  @IsOptional()
  @IsObject()
  lube_prices?: Record<string, number>;
}
