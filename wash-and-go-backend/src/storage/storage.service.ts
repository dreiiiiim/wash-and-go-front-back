import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

const BUCKET = 'payment-proofs';

@Injectable()
export class StorageService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Creates a signed upload URL so the frontend can upload
   * a payment proof image directly to Supabase Storage.
   * Returns the upload URL and the final public path.
   */
  async createSignedUploadUrl(fileName: string): Promise<{ signedUrl: string; path: string }> {
    const path = `proofs/${Date.now()}-${fileName}`;

    const { data, error } = await this.supabase
      .getAdminClient()
      .storage
      .from(BUCKET)
      .createSignedUploadUrl(path);

    if (error) throw new Error(error.message);
    return { signedUrl: data.signedUrl, path };
  }

  async getSignedViewUrl(path: string, requestingUserId: string): Promise<string> {
    const normalizedPath = this.normalizeStoragePath(path);
    await this.assertCanViewPath(normalizedPath, requestingUserId);

    const { data, error } = await this.supabase
      .getAdminClient()
      .storage
      .from(BUCKET)
      .createSignedUrl(normalizedPath, 60 * 60); // 1 hour

    if (error) throw new Error(error.message);
    return data.signedUrl;
  }

  private async assertCanViewPath(path: string, requestingUserId: string): Promise<void> {
    const adminClient = this.supabase.getAdminClient();

    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', requestingUserId)
      .single();

    if (profile?.role === 'admin') return;

    const { data: bookings, error } = await adminClient
      .from('bookings')
      .select('payment_proof_url')
      .eq('user_id', requestingUserId)
      .not('payment_proof_url', 'is', null);

    if (error) throw new Error(error.message);

    const ownsPath = (bookings || []).some((booking) => {
      return this.normalizeStoragePath(booking.payment_proof_url) === path;
    });

    if (!ownsPath) {
      throw new ForbiddenException('You are not allowed to view this file');
    }
  }

  private normalizeStoragePath(value?: string | null): string {
    if (!value) {
      throw new BadRequestException('Missing storage path');
    }

    const decodedValue = decodeURIComponent(value.trim());
    const bucketPathMarker = `/${BUCKET}/`;
    let path = decodedValue;

    try {
      const url = new URL(decodedValue);
      const markerIndex = url.pathname.indexOf(bucketPathMarker);
      path = markerIndex >= 0
        ? url.pathname.slice(markerIndex + bucketPathMarker.length)
        : url.pathname.replace(/^\/+/, '');
    } catch {
      path = decodedValue.replace(/^\/+/, '');
    }

    if (!path || path.includes('..')) {
      throw new BadRequestException('Invalid storage path');
    }

    return path;
  }
}
