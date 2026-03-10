import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private supabase: SupabaseService) {}

  async create(dto: CreateBookingDto, userId?: string) {
    // 1. Fetch service
    const { data: service, error: svcError } = await this.supabase
      .getAdminClient()
      .from('services')
      .select('*')
      .eq('id', dto.serviceId)
      .eq('is_active', true)
      .single();

    if (svcError || !service) {
      throw new NotFoundException(`Service '${dto.serviceId}' not found`);
    }

    // 2. Check slot availability
    const isAvailable = await this.isSlotAvailable(dto.date, dto.timeSlot);
    if (!isAvailable) {
      throw new ConflictException(`Time slot ${dto.timeSlot} on ${dto.date} is already booked`);
    }

    // 3. Calculate price
    let totalPrice: number;
    if (service.is_lube_flat && service.lube_prices && dto.fuelType) {
      totalPrice = service.lube_prices[dto.fuelType];
    } else if (service.is_lube_flat) {
      totalPrice = service.price_small;
    } else {
      const sizeKey = `price_${dto.vehicleSize.toLowerCase()}`;
      totalPrice = service[sizeKey === 'price_extra_large' ? 'price_extra_large' : sizeKey];
    }
    const downPaymentAmount = Math.round(totalPrice * 0.3);

    // 4. Generate booking ID
    const id = `BK-${Math.floor(100000 + Math.random() * 900000)}`;

    // 5. Insert booking
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('bookings')
      .insert({
        id,
        user_id: userId || null,
        customer_name: dto.customerName,
        customer_phone: dto.customerPhone,
        service_id: dto.serviceId,
        service_name: service.name,
        vehicle_size: dto.vehicleSize,
        vehicle_type: dto.vehicleType || null,
        fuel_type: dto.fuelType || null,
        oil_type: dto.oilType || null,
        date: dto.date,
        time_slot: dto.timeSlot,
        plate_number: dto.plateNumber || null,
        total_price: totalPrice,
        down_payment_amount: downPaymentAmount,
        status: 'PENDING',
        payment_proof_url: dto.paymentProofUrl || null,
        payment_method: dto.paymentMethod || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.toBooking(data);
  }

  async findById(id: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('bookings')
      .select('*')
      .eq('id', id.toUpperCase())
      .single();

    if (error || !data) throw new NotFoundException(`Booking ${id} not found`);
    return this.toBooking(data);
  }

  async findAll(filters?: { status?: string; date?: string }) {
    let query = this.supabase
      .getAdminClient()
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status);
    }
    if (filters?.date) {
      query = query.eq('date', filters.date);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data.map(this.toBooking);
  }

  async getBookedSlots(date: string): Promise<string[]> {
    const { data } = await this.supabase
      .getAdminClient()
      .from('bookings')
      .select('time_slot')
      .eq('date', date)
      .in('status', ['PENDING', 'CONFIRMED']);

    return (data || []).map((b: any) => b.time_slot);
  }

  async findMyBookings(userId: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(this.toBooking);
  }

  async updateStatus(
    id: string,
    status: string,
    requestingUserId: string,
  ) {
    const { data: profile } = await this.supabase
      .getAdminClient()
      .from('profiles')
      .select('role')
      .eq('id', requestingUserId)
      .single();

    if (profile?.role !== 'admin') {
      throw new ForbiddenException('Only admins can update booking status');
    }

    // Normalize UI status strings to DB enum values
    const statusMap: Record<string, string> = {
      'pending': 'PENDING',
      'confirmed': 'CONFIRMED',
      'in progress': 'IN_PROGRESS',
      'in_progress': 'IN_PROGRESS',
      'completed': 'COMPLETED',
      'cancelled': 'CANCELLED',
    };
    const normalizedStatus = statusMap[status.toLowerCase()] ?? status.toUpperCase();

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('bookings')
      .update({ status: normalizedStatus })
      .eq('id', id.toUpperCase())
      .select()
      .maybeSingle();

    if (error) {
      throw new BadRequestException(`Failed to update booking status: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Booking ${id.toUpperCase()} not found`);
    }

    return this.toBooking(data);
  }

  async checkAvailability(date: string, timeSlot: string) {
    const available = await this.isSlotAvailable(date, timeSlot);
    return { date, timeSlot, available };
  }

  private async isSlotAvailable(date: string, timeSlot: string): Promise<boolean> {
    const { data } = await this.supabase
      .getAdminClient()
      .from('bookings')
      .select('id')
      .eq('date', date)
      .eq('time_slot', timeSlot)
      .in('status', ['PENDING', 'CONFIRMED'])
      .limit(1);

    return !data || data.length === 0;
  }

  private toBooking(row: any) {
    return {
      id: row.id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      serviceId: row.service_id,
      serviceName: row.service_name,
      vehicleSize: row.vehicle_size,
      vehicleType: row.vehicle_type,
      vehicleCategory: row.vehicle_type === 'MOTORCYCLE' ? 'Motorcycle' : 'Car',
      fuelType: row.fuel_type,
      oilType: row.oil_type,
      date: row.date,
      timeSlot: row.time_slot,
      plateNumber: row.plate_number,
      totalPrice: row.total_price,
      downPaymentAmount: row.down_payment_amount,
      status: row.status,
      paymentProofUrl: row.payment_proof_url,
      paymentMethod: row.payment_method,
      createdAt: new Date(row.created_at).getTime(),
    };
  }
}
