import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';

enum VehicleSizeDto {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  EXTRA_LARGE = 'EXTRA_LARGE',
}

enum VehicleTypeDto {
  VEHICLE = 'VEHICLE',
  MOTORCYCLE = 'MOTORCYCLE',
}

enum FuelTypeDto {
  GAS = 'GAS',
  DIESEL = 'DIESEL',
}

enum OilTypeDto {
  REGULAR = 'REGULAR',
  SEMI_SYNTHETIC = 'SEMI_SYNTHETIC',
  FULLY_SYNTHETIC = 'FULLY_SYNTHETIC',
}

export class CreateBookingDto {
  @IsString()
  customerName: string;

  @IsString()
  customerPhone: string;

  @IsString()
  serviceId: string;

  @IsEnum(VehicleSizeDto)
  vehicleSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';

  @IsOptional()
  @IsEnum(VehicleTypeDto)
  vehicleType?: 'VEHICLE' | 'MOTORCYCLE';

  @IsOptional()
  @IsEnum(FuelTypeDto)
  fuelType?: 'GAS' | 'DIESEL';

  @IsOptional()
  @IsEnum(OilTypeDto)
  oilType?: 'REGULAR' | 'SEMI_SYNTHETIC' | 'FULLY_SYNTHETIC';

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;       // YYYY-MM-DD

  @IsString()
  timeSlot: string;   // e.g. "08:00 AM"

  @IsOptional()
  @IsString()
  plateNumber?: string;

  @IsOptional()
  @IsString()
  paymentProofUrl?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
