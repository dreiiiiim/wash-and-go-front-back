import { Body, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { EmailSignupDto } from './dto/email-signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: EmailSignupDto) {
    return this.authService.signUpWithEmail(dto);
  }

  /**
   * GET /api/auth/google
   * Redirects the user to Google OAuth via Supabase.
   * Query param `redirectTo` = where Supabase should send the user after auth.
   */
  @Get('google')
  async googleAuth(
    @Query('redirectTo') redirectTo: string,
    @Res() res: Response,
  ) {
    const fallback = 'http://localhost:5173/auth/callback';
    const url = await this.authService.getGoogleOAuthUrl(redirectTo || fallback);
    return res.redirect(url);
  }

  /**
   * GET /api/auth/me
   * Returns the currently authenticated user's profile.
   * Requires a valid Supabase JWT in the Authorization header.
   */
  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: any) {
    return user;
  }
}
