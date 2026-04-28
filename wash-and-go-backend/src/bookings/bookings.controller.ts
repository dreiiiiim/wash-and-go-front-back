import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AddUpdateDto } from './dto/add-update.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  /** POST /api/bookings — Create booking (auth required) */
  @UseGuards(SupabaseAuthGuard)
  @Post()
  create(@Body() dto: CreateBookingDto, @CurrentUser() user: any) {
    return this.bookingsService.create(dto, user.id);
  }

  /** GET /api/bookings/booked-slots?date=YYYY-MM-DD&category=LUBE — Booked time slots for a date */
  @Get('booked-slots')
  getBookedSlots(
    @Query('date') date: string,
    @Query('category') category?: string,
  ) {
    return this.bookingsService.getBookedSlots(date, category);
  }

  /** GET /api/bookings/availability?date=&timeSlot=&category= — Check single slot */
  @Get('availability')
  checkAvailability(
    @Query('date') date: string,
    @Query('timeSlot') timeSlot: string,
    @Query('category') category?: string,
  ) {
    return this.bookingsService.checkAvailability(date, timeSlot, category);
  }

  /** GET /api/bookings/my-bookings — Customer's own bookings */
  @UseGuards(SupabaseAuthGuard)
  @Get('my-bookings')
  findMyBookings(@CurrentUser() user: any) {
    return this.bookingsService.findMyBookings(user.id);
  }

  /** GET /api/bookings/:id — Get booking by ID (public, for status check) */
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }

  /** GET /api/bookings — All bookings (admin only) */
  @UseGuards(SupabaseAuthGuard)
  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('date') date?: string,
    @CurrentUser() user?: any,
  ) {
    return this.bookingsService.findAll({ status, date }, user?.id);
  }

  /** PATCH /api/bookings/:id/status — Update status (admin only) */
  @UseGuards(SupabaseAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.updateStatus(id, dto.status, user.id);
  }

  /** POST /api/bookings/:id/updates — Add progress update with photos (admin only) */
  @UseGuards(SupabaseAuthGuard)
  @Post(':id/updates')
  addUpdate(
    @Param('id') id: string,
    @Body() dto: AddUpdateDto,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.addUpdate(id, dto.message, dto.imageUrls || [], user.id);
  }
}
