import { IsEmail, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class EmailSignupDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  redirectTo?: string;
}
