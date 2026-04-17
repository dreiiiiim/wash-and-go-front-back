import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { BookingsModule } from './bookings/bookings.module';
import { StorageModule } from './storage/storage.module';
import { EmailModule } from './email/email.module';
import { HealthController } from './common/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Resolve backend env file even when process is launched from repo root.
      envFilePath: [join(__dirname, '..', '.env'), '.env'],
    }),
    SupabaseModule,
    AuthModule,
    ServicesModule,
    BookingsModule,
    StorageModule,
    EmailModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
