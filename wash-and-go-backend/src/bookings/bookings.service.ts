import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private supabase: SupabaseService,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateBookingDto, userId?: string) {
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

    const isAvailable = await this.isSlotAvailable(dto.date, dto.timeSlot, service.category);
    if (!isAvailable) {
      throw new ConflictException(`Time slot ${dto.timeSlot} on ${dto.date} is already full for this service type.`);
    }

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

    const id = `BK-${Math.floor(100000 + Math.random() * 900000)}`;

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
    const booking = this.toBooking(data);

    void this.notifyBookingCreated(booking, dto.customerName, userId);
    return booking;
  }

  async findById(id: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('bookings')
      .select('*, booking_updates(*)')
      .eq('id', id.toUpperCase())
      .single();

    if (error || !data) throw new NotFoundException(`Booking ${id} not found`);
    return this.toBooking(data);
  }

  async findAll(
    filters?: { status?: string; date?: string },
    requestingUserId?: string,
  ) {
    const { data: profile } = await this.supabase
      .getAdminClient()
      .from('profiles')
      .select('role')
      .eq('id', requestingUserId)
      .single();

    if (profile?.role !== 'admin') {
      throw new ForbiddenException('Only admins can view all bookings');
    }

    let query = this.supabase
      .getAdminClient()
      .from('bookings')
      .select('*, booking_updates(*)')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status);
    }
    if (filters?.date) {
      query = query.eq('date', filters.date);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data.map(row => this.toBooking(row));
  }

  async getBookedSlots(date: string, category?: string): Promise<string[]> {
    let maxCapacity = 1;
    if (category === 'LUBE') maxCapacity = 1;
    if (category === 'GROOMING') maxCapacity = 2;
    if (category === 'COATING') maxCapacity = 2;

    let query = this.supabase
      .getAdminClient()
      .from('bookings')
      .select('time_slot, services!inner(category)')
      .eq('date', date)
      .in('status', ['PENDING', 'CONFIRMED', 'REUPLOAD_REQUIRED']);

    if (category) {
      query = query.eq('services.category', category);
    }

    const { data } = await query;

    const slotCounts: Record<string, number> = {};
    if (data) {
      for (const b of data) {
        slotCounts[b.time_slot] = (slotCounts[b.time_slot] || 0) + 1;
      }
    }

    return Object.keys(slotCounts).filter(slot => slotCounts[slot] >= maxCapacity);
  }

  async findMyBookings(userId: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('bookings')
      .select('*, booking_updates(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(row => this.toBooking(row));
  }

  async updateStatus(id: string, status: string, requestingUserId: string) {
    const { data: profile } = await this.supabase
      .getAdminClient()
      .from('profiles')
      .select('role')
      .eq('id', requestingUserId)
      .single();

    if (profile?.role !== 'admin') {
      throw new ForbiddenException('Only admins can update booking status');
    }

    const statusMap: Record<string, string> = {
      'pending': 'PENDING',
      'confirmed': 'CONFIRMED',
      'in progress': 'IN_PROGRESS',
      'in_progress': 'IN_PROGRESS',
      'completed': 'COMPLETED',
      'cancelled': 'CANCELLED',
      're-upload': 'REUPLOAD_REQUIRED',
      'reupload': 'REUPLOAD_REQUIRED',
      'reupload_required': 'REUPLOAD_REQUIRED',
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

    const booking = this.toBooking(data);
    void this.notifyBookingStatusUpdated(booking, data.user_id);
    return booking;
  }

  async resubmitPaymentProof(
    id: string,
    paymentProofUrl: string,
    paymentMethod: string | undefined,
    requestingUserId: string,
  ) {
    const bookingId = id.toUpperCase();

    const { data: existing, error: existingError } = await this.supabase
      .getAdminClient()
      .from('bookings')
      .select('*, services(category)')
      .eq('id', bookingId)
      .single();

    if (existingError || !existing) {
      throw new NotFoundException(`Booking ${bookingId} not found`);
    }

    if (existing.user_id !== requestingUserId) {
      throw new ForbiddenException('You can only resubmit your own bookings');
    }

    if (existing.status !== 'REUPLOAD_REQUIRED') {
      throw new BadRequestException('Only bookings marked for re-upload can be resubmitted');
    }

    const isAvailable = await this.isSlotAvailable(
      existing.date,
      existing.time_slot,
      existing.services?.category,
      bookingId,
    );
    if (!isAvailable) {
      throw new ConflictException('This booking slot is no longer available. Please create a new booking with a different schedule.');
    }

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('bookings')
      .update({
        payment_proof_url: paymentProofUrl,
        ...(paymentMethod ? { payment_method: paymentMethod } : {}),
        status: 'PENDING',
      })
      .eq('id', bookingId)
      .select('*, booking_updates(*)')
      .single();

    if (error) {
      throw new BadRequestException(`Failed to resubmit booking: ${error.message}`);
    }

    const booking = this.toBooking(data);
    void this.notifyBookingCreated(booking, booking.customerName, requestingUserId);
    return booking;
  }

  async addUpdate(
    id: string,
    message: string,
    imageUrls: string[],
    requestingUserId: string,
  ) {
    const { data: profile } = await this.supabase
      .getAdminClient()
      .from('profiles')
      .select('role')
      .eq('id', requestingUserId)
      .single();

    if (profile?.role !== 'admin') {
      throw new ForbiddenException('Only admins can add booking updates');
    }

    const { data: booking, error: bookingError } = await this.supabase
      .getAdminClient()
      .from('bookings')
      .select('*')
      .eq('id', id.toUpperCase())
      .single();

    if (bookingError || !booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }

    const { data: update, error } = await this.supabase
      .getAdminClient()
      .from('booking_updates')
      .insert({
        booking_id: id.toUpperCase(),
        message,
        image_urls: imageUrls,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    void this.notifyProgressUpdate(booking, update);

    return {
      id: update.id,
      timestamp: update.created_at,
      message: update.message,
      imageUrls: update.image_urls || [],
      imageUrl: (update.image_urls || [])[0],
    };
  }

  async checkAvailability(date: string, timeSlot: string, category?: string) {
    const available = await this.isSlotAvailable(date, timeSlot, category);
    return { date, timeSlot, available, category };
  }

  private async isSlotAvailable(
    date: string,
    timeSlot: string,
    serviceCategory?: string,
    excludeBookingId?: string,
  ): Promise<boolean> {
    let maxCapacity = 1;
    if (serviceCategory === 'LUBE') maxCapacity = 1;
    if (serviceCategory === 'GROOMING') maxCapacity = 2;
    if (serviceCategory === 'COATING') maxCapacity = 2;

    let query = this.supabase
      .getAdminClient()
      .from('bookings')
      .select('id, services!inner(category)')
      .eq('date', date)
      .eq('time_slot', timeSlot)
      .in('status', ['PENDING', 'CONFIRMED', 'REUPLOAD_REQUIRED']);

    if (serviceCategory) {
      query = query.eq('services.category', serviceCategory);
    }
    if (excludeBookingId) {
      query = query.neq('id', excludeBookingId);
    }

    const { data } = await query;
    return !data || data.length < maxCapacity;
  }

  private async notifyBookingCreated(booking: any, customerName: string, userId?: string) {
    try {
      const customerEmail = await this.getUserEmail(userId);
      if (customerEmail) {
        await this.emailService.sendBookingCreatedCustomerEmail({
          to: customerEmail,
          customerName,
          bookingId: booking.id,
          serviceName: booking.serviceName,
          date: booking.date,
          timeSlot: booking.timeSlot,
          status: booking.status,
        });
      }

      await this.emailService.sendBookingCreatedAdminEmail({
        customerName,
        bookingId: booking.id,
        serviceName: booking.serviceName,
        date: booking.date,
        timeSlot: booking.timeSlot,
        status: booking.status,
      });
    } catch (error: any) {
      this.logger.warn(`Booking created email notification failed: ${error?.message || error}`);
    }
  }

  private async notifyBookingStatusUpdated(booking: any, userId?: string) {
    try {
      const customerEmail = await this.getUserEmail(userId);
      if (!customerEmail) return;

      await this.emailService.sendBookingStatusEmail({
        to: customerEmail,
        customerName: booking.customerName,
        bookingId: booking.id,
        serviceName: booking.serviceName,
        date: booking.date,
        timeSlot: booking.timeSlot,
        status: booking.status,
      });
    } catch (error: any) {
      this.logger.warn(`Booking status email notification failed: ${error?.message || error}`);
    }
  }

  private async notifyProgressUpdate(booking: any, update: any) {
    try {
      const customerEmail = await this.getUserEmail(booking.user_id);
      if (!customerEmail) return;

      await this.emailService.sendProgressUpdateEmail({
        to: customerEmail,
        customerName: booking.customer_name,
        bookingId: booking.id,
        serviceName: booking.service_name,
        date: booking.date,
        timeSlot: booking.time_slot,
        status: booking.status,
        message: update.message,
        imageUrls: update.image_urls || [],
      });
    } catch (error: any) {
      this.logger.warn(`Progress update email notification failed: ${error?.message || error}`);
    }
  }

  private async getUserEmail(userId?: string): Promise<string | undefined> {
    if (!userId) return undefined;
    const { data, error } = await this.supabase
      .getAdminClient()
      .auth.admin.getUserById(userId);

    if (error || !data?.user?.email) return undefined;
    return data.user.email;
  }

  private toBooking(row: any) {
    const updates = (row.booking_updates || [])
      .slice()
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((u: any) => ({
        id: u.id,
        timestamp: u.created_at,
        message: u.message,
        imageUrls: u.image_urls || [],
        imageUrl: (u.image_urls || [])[0],
      }));

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
      updates,
    };
  }
}
