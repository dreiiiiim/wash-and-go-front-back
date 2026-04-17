import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configuredCORSOrigins = process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '';
  const configuredOrigins = [
    ...configuredCORSOrigins
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    'http://localhost:3000',
    'https://wash-and-go-front-back-*.vercel.app',
  ]
    .filter(Boolean)
    .filter((origin, index, all) => all.indexOf(origin) === index);

  const exactOrigins = configuredOrigins.filter((origin) => !origin.includes('*'));
  const wildcardOrigins = configuredOrigins
    .filter((origin) => origin.includes('*'))
    .map((origin) => new RegExp(`^${escapeRegex(origin).replace(/\\\*/g, '.*')}$`));

  const allowAllVercelOrigins = process.env.CORS_ALLOW_VERCEL?.toLowerCase() === 'true';

  const isAllowedOrigin = (origin: string): boolean => {
    if (exactOrigins.includes(origin)) return true;
    if (wildcardOrigins.some((pattern) => pattern.test(origin))) return true;

    if (!allowAllVercelOrigins) return false;

    try {
      return new URL(origin).hostname.endsWith('.vercel.app');
    } catch {
      return false;
    }
  };

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) return callback(null, true);

      logger.warn(`Blocked CORS origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  });

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application running on http://localhost:${port}/api`);
}
bootstrap();

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
