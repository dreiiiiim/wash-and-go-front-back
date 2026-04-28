import { IsEmail, IsOptional, IsUrl } from 'class-validator';

export class RequestPasswordResetDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  redirectTo?: string;
}
