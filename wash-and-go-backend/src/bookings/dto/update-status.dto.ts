import { IsEnum } from 'class-validator';

enum BookingStatusDto {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export class UpdateStatusDto {
  @IsEnum(BookingStatusDto)
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}
