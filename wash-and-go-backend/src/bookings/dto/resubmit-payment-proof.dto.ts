import { IsOptional, IsString } from 'class-validator';

export class ResubmitPaymentProofDto {
  @IsString()
  paymentProofUrl: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
