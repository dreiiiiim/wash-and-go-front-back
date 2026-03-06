import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Generates the Google OAuth redirect URL via Supabase Auth.
   * The frontend redirects the user to this URL to begin the OAuth flow.
   */
  async getGoogleOAuthUrl(redirectTo: string): Promise<string> {
    const { data, error } = await this.supabase
      .getClient()
      .auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          scopes: 'email profile',
          skipBrowserRedirect: true,
        },
      });

    if (error) throw new UnauthorizedException(error.message);
    return data.url;
  }

  /**
   * Validates a Supabase JWT access token.
   * Call this from the auth guard on protected routes.
   */
  async getUserFromToken(accessToken: string) {
    const { data, error } = await this.supabase
      .getClient()
      .auth.getUser(accessToken);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return data.user;
  }

  /**
   * Fetches the profile row for a given user ID.
   */
  async getProfile(userId: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new UnauthorizedException(error.message);
    return data;
  }
}
