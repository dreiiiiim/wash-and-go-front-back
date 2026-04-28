import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateShopSettingsDto } from './dto/update-shop-settings.dto';

const DEFAULT_SETTINGS_ID = 'default';
const OPERATING_HOUR_OPTIONS = [
  '12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM',
  '04:00 AM', '05:00 AM', '06:00 AM', '07:00 AM',
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
  '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM',
];

@Injectable()
export class ShopSettingsService {
  constructor(private supabase: SupabaseService) {}

  async findDefault(date?: string) {
    if (date) {
      const { data } = await this.supabase
        .getClient()
        .from('shop_settings')
        .select('id, setting_date, open_time, close_time, updated_at')
        .eq('setting_date', date)
        .maybeSingle();

      if (data) return data;
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('shop_settings')
      .select('id, setting_date, open_time, close_time, updated_at')
      .eq('id', DEFAULT_SETTINGS_ID)
      .single();

    if (error || !data) {
      throw new NotFoundException('Shop settings not found');
    }

    return data;
  }

  async update(dto: UpdateShopSettingsDto, requestingUserId: string) {
    await this.assertAdmin(requestingUserId);

    const openIndex = OPERATING_HOUR_OPTIONS.indexOf(dto.open_time);
    const closeIndex = OPERATING_HOUR_OPTIONS.indexOf(dto.close_time);

    if (openIndex === -1 || closeIndex === -1) {
      throw new BadRequestException('Open time and close time must be valid hourly times');
    }

    if (openIndex >= closeIndex) {
      throw new BadRequestException('Open time must be earlier than close time');
    }

    const targetDate = dto.date?.trim();
    const targetId = targetDate || DEFAULT_SETTINGS_ID;

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('shop_settings')
      .upsert({
        id: targetId,
        setting_date: targetDate || null,
        open_time: dto.open_time,
        close_time: dto.close_time,
        updated_at: new Date().toISOString(),
      })
      .select('id, setting_date, open_time, close_time, updated_at')
      .single();

    if (error || !data) {
      throw new NotFoundException('Shop settings not found');
    }

    return data;
  }

  private async assertAdmin(requestingUserId: string): Promise<void> {
    const { data: profile } = await this.supabase
      .getAdminClient()
      .from('profiles')
      .select('role')
      .eq('id', requestingUserId)
      .single();

    if (profile?.role !== 'admin') {
      throw new ForbiddenException('Only admins can update shop settings');
    }
  }
}
