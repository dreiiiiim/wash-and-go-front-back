import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  /** POST /api/bookings — Create booking (auth optional) */
  @Post()
  create(@Body() dto: CreateBookingDto, @Request() req: any) {
    const userId = req['user']?.id || null;
    return this.bookingsService.create(dto, userId);
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
  ) {
    return this.bookingsService.findAll({ status, date });
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
}
