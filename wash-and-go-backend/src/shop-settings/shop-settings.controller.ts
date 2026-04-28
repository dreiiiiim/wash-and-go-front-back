import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { UpdateShopSettingsDto } from './dto/update-shop-settings.dto';
import { ShopSettingsService } from './shop-settings.service';

@Controller('shop-settings')
export class ShopSettingsController {
  constructor(private shopSettingsService: ShopSettingsService) {}

  @Get()
  findDefault(@Query('date') date?: string) {
    return this.shopSettingsService.findDefault(date);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch()
  update(@Body() dto: UpdateShopSettingsDto, @CurrentUser() user: any) {
    return this.shopSettingsService.update(dto, user.id);
  }
}
