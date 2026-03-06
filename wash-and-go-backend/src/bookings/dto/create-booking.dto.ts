export class CreateBookingDto {
  customerName: string;
  customerPhone: string;
  serviceId: string;
  vehicleSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';
  vehicleType?: 'VEHICLE' | 'MOTORCYCLE';
  fuelType?: 'GAS' | 'DIESEL';
  oilType?: 'REGULAR' | 'SEMI_SYNTHETIC' | 'FULLY_SYNTHETIC';
  date: string;       // YYYY-MM-DD
  timeSlot: string;   // e.g. "08:00 AM"
  plateNumber?: string;
  paymentProofUrl?: string;
  paymentMethod?: string;
}
