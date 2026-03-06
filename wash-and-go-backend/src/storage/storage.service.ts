import { Injectable } from '@nestjs/common';
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

  /**
   * Returns a short-lived signed URL to view a payment proof.
   * Used by admins to view uploaded proofs.
   */
  async getSignedViewUrl(path: string): Promise<string> {
    const { data, error } = await this.supabase
      .getAdminClient()
      .storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60); // 1 hour

    if (error) throw new Error(error.message);
    return data.signedUrl;
  }
}
