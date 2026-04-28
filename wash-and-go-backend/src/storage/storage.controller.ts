import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { StorageService } from './storage.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('storage')
export class StorageController {
  constructor(private storageService: StorageService) {}

  /**
   * POST /api/storage/upload-url?fileName=proof.jpg
   * Get a signed URL to upload a payment proof image.
   * Auth required — users must be logged in to upload.
   */
  @UseGuards(SupabaseAuthGuard)
  @Post('upload-url')
  getUploadUrl(@Query('fileName') fileName: string) {
    return this.storageService.createSignedUploadUrl(fileName);
  }

  /**
   * GET /api/storage/view-url?path=proofs/12345-proof.jpg
   * Get a signed URL to view a payment proof image.
   * Admin use only (guard should be checked at service level).
   */
  @UseGuards(SupabaseAuthGuard)
  @Get('view-url')
  getViewUrl(@Query('path') path: string, @CurrentUser() user: any) {
    return this.storageService.getSignedViewUrl(path, user.id);
  }
}
