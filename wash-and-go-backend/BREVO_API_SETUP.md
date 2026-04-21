# Brevo API Email Switch Guide

This backend now sends email directly through Brevo API (no Nodemailer transport), while keeping all existing HTML templates unchanged.

## 1. Brevo Dashboard Setup

1. Create/sign in to Brevo.
2. Verify sender identity:
   - Recommended: verify sending domain and configure SPF/DKIM.
   - Minimum: verify the sender email address.
3. Create a Brevo API key in SMTP & API settings.
4. Copy and store the API key securely.

Use a Brevo API key (`api-key` header), not SMTP credentials.

## 2. Railway Variables

Set these on backend service:

```env
BREVO_API_KEY=<brevo-api-key>
BREVO_BASE_URL=https://api.brevo.com
BREVO_SENDER_EMAIL=<verified-sender@yourdomain.com>
BREVO_SENDER_NAME=Wash & Go Auto Salon
BREVO_TIMEOUT_MS=15000

# Optional testing mode (request validates but no email is sent)
# BREVO_SANDBOX=true

# Optional backward-compatible sender fallback
SMTP_FROM=<verified-sender@yourdomain.com>
SMTP_FROM_NAME=Wash & Go Auto Salon
```

Keep existing Supabase/Auth/CORS variables unchanged.

## 3. Behavior Notes

- Templates are unchanged (same HTML/text content from `EmailService`).
- Signup remains fail-safe: if verification email fails, signup fails and created user is rolled back.
- No public API changes.

## 4. Verification Checklist

1. Signup with a new email -> expect success response and verification email delivered.
2. Forgot password -> expect generic success response and reset email delivered.
3. Create booking and update booking status -> expect customer/admin emails delivered.
4. Temporarily break `BREVO_API_KEY` -> signup should fail (expected behavior).
