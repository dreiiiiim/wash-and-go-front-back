import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ServicesService {
  constructor(private supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase
      .getClient()
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('category');

    if (error) throw new Error(error.message);
    return data.map(this.toServicePackage);
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('services')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !data) throw new NotFoundException(`Service ${id} not found`);
    return this.toServicePackage(data);
  }

  private toServicePackage(row: any) {
    return {
      id: row.id,
      category: row.category,
      name: row.name,
      description: row.description,
      durationHours: row.duration_hours,
      isLubeFlat: row.is_lube_flat,
      lubePrices: row.lube_prices ?? undefined,
      vehicleType: row.vehicle_type ?? undefined,
      prices: {
        SMALL: row.price_small,
        MEDIUM: row.price_medium,
        LARGE: row.price_large,
        EXTRA_LARGE: row.price_extra_large,
      },
    };
  }
}
