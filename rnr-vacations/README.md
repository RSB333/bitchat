# RNR Vacations

A modern marketplace for hotels and timeshares. Built with React + Vite + Tailwind + Supabase + Stripe.

## Getting started

1. Copy `.env.example` to `.env` and fill values:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY` (optional)
2. In Supabase SQL editor, run `supabase.sql`.
3. Storage: create a bucket named `images` (public).
4. Deploy Edge Functions (if using Supabase Edge Runtime) for:
   - `create-checkout-session`
   - `stripe-webhook`
   - `create-onboarding-link`
   - `notify-message`
   - `connect-summary`

## Develop

```bash
pnpm i # or npm i / yarn
pnpm dev
```

## Build

```bash
pnpm build
pnpm preview
```

## Notes
- Bookings table drives blocked dates on calendars.
- Payouts tab pulls Stripe Connect balance, payouts, transfers.
- Messaging sends email notifications via Resend if configured.