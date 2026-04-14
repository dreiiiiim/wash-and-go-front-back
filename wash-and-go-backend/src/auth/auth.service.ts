import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailService } from '../email/email.service';
import { EmailSignupDto } from './dto/email-signup.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private supabase: SupabaseService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  async signUpWithEmail(dto: EmailSignupDto) {
    const email = dto.email?.trim().toLowerCase();
    const fullName = dto.fullName?.trim();
    const phone = dto.phone?.trim();
    const password = dto.password;

    if (!email || !fullName || !password) {
      throw new BadRequestException('Full name, email, and password are required.');
    }

    const redirectTo =
      dto.redirectTo?.trim() ||
      this.config.get<string>('FRONTEND_URL') ||
      'http://localhost:3000';

    const { data, error } = await this.supabase.getAdminClient().auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: {
        data: { full_name: fullName },
        redirectTo,
      },
    });

    if (error || !data?.user || !data?.properties?.action_link) {
      throw new BadRequestException(error?.message || 'Unable to create account.');
    }

    if (phone) {
      const { error: phoneUpdateError } = await this.supabase
        .getAdminClient()
        .from('profiles')
        .update({ phone })
        .eq('id', data.user.id);

      if (phoneUpdateError) {
        this.logger.warn(`Profile phone update failed for ${data.user.id}: ${phoneUpdateError.message}`);
      }
    }

    try {
      await this.emailService.sendVerificationEmail({
        to: email,
        fullName,
        confirmationUrl: data.properties.action_link,
      });
    } catch (mailError: any) {
      this.logger.error(`Verification email failed for ${email}: ${mailError?.message || mailError}`);
      try {
        await this.supabase.getAdminClient().auth.admin.deleteUser(data.user.id);
      } catch (cleanupError: any) {
        this.logger.error(
          `Failed cleanup for user ${data.user.id}: ${cleanupError?.message || cleanupError}`,
        );
      }
      throw new InternalServerErrorException(
        'Unable to send verification email. Please try again after SMTP is configured.',
      );
    }

    return {
      message: 'Account created. Please check your email to confirm your account.',
    };
  }

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
