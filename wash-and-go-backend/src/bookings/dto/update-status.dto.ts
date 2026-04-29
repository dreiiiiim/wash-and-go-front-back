import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REUPLOAD_REQUIRED = 'REUPLOAD_REQUIRED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export class UpdateStatusDto {
  @Transform(({ value }) => value?.toUpperCase().replace(/\s+/g, '_'))
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
