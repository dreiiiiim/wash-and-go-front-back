export enum ServiceCategory {
  LUBE = 'LUBE',
  GROOMING = 'GROOMING',
  COATING = 'COATING'
}

export enum VehicleSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  EXTRA_LARGE = 'EXTRA_LARGE'
}

export enum VehicleType {
  VEHICLE = 'VEHICLE',
  MOTORCYCLE = 'MOTORCYCLE'
}

export enum FuelType {
  GAS = 'GAS',
  DIESEL = 'DIESEL'
}

export enum OilType {
  REGULAR = 'REGULAR',
  SEMI_SYNTHETIC = 'SEMI_SYNTHETIC',
  FULLY_SYNTHETIC = 'FULLY_SYNTHETIC'
}

export enum LubePackageType {
  EXPRESS = 'EXPRESS',
  PREMIUM = 'PREMIUM'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface ServicePackage {
  id: string;
  category: ServiceCategory;
  name: string;
  description: string;
  durationHours: number;

  // For Grooming & Ceramic services — price varies by vehicle size
  prices: Record<VehicleSize, number>;

  // For Lube services — flat price by fuel type (no vehicle size variation)
  lubePrices?: Record<FuelType, number>;

  // Lube-specific fields
  lubePackageType?: LubePackageType;
  oilType?: OilType;

  // Ceramic-specific: Vehicle vs Motorcycle
  vehicleType?: VehicleType;

  // Whether this service uses flat pricing (lubePrices) instead of size-based pricing
  isLubeFlat?: boolean;
}

export interface BookingUpdate {
  id: string;
  timestamp: string;
  message: string;
  imageUrl?: string;
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  vehicleSize: VehicleSize;
  vehicleType?: VehicleType;
  fuelType?: FuelType;
  oilType?: OilType;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm AM/PM
  totalPrice: number;
  downPaymentAmount: number;
  status: BookingStatus;
  paymentProofUrl?: string;
  createdAt: number;

  // Extended admin fields
  contact?: string;           // alias / display for customerPhone
  email?: string;
  vehicleCategory?: 'Car' | 'Motorcycle';
  bayType?: 'Wash' | 'Lube' | 'Detailing' | 'Coating';
  plateNumber?: string;
  time?: string;              // display time (e.g. '09:00 AM'), falls back to timeSlot
  downPayment?: number;       // alias for downPaymentAmount
  paymentMethod?: string;
  referenceNumber?: string;
  updates?: BookingUpdate[];
}

export interface TimeSlot {
  time: string; // "08:00 AM"
  available: boolean;
}
