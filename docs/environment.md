# Environment & Configuration

## Required Variables

Create `.env.local` (never commit this file).

```bash
# Database — Neon PostgreSQL
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/nekohub?sslmode=require

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Variable Notes

### DATABASE_URL

- `DATABASE_URL` is the **pooled** Neon connection used at runtime.
- `prisma.config.ts` automatically derives a direct (non-pooled) URL from it by stripping `-pooler.` from the hostname and removing the `channel_binding` param — no separate variable needed for migrations.

### Stripe Keys

- `STRIPE_SECRET_KEY` is server-side only — never expose to the browser.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is client-safe; prefix `NEXT_PUBLIC_` makes it available in the browser bundle.
- `STRIPE_WEBHOOK_SECRET` comes from the Stripe Dashboard (or `stripe listen` CLI output in dev).

### Missing / TBD Variables

The following will be required once those features are built:

| Variable                                    | Purpose                                 |
| ------------------------------------------- | --------------------------------------- |
| `NEXTAUTH_SECRET` / `AUTH_SECRET`           | Session signing (if NextAuth/Auth.js)   |
| `NEXTAUTH_URL`                              | Canonical app URL (if NextAuth/Auth.js) |
| `STORAGE_BUCKET` / `STORAGE_ENDPOINT`       | File uploads for content items          |
| `EMAIL_FROM` / `SMTP_*` or `RESEND_API_KEY` | Transactional email                     |

## Environment Precedence (Next.js)

1. `.env.local` (gitignored, highest priority)
2. `.env.development` / `.env.production`
3. `.env` (base, lowest priority)

## Stripe Webhook Setup

**Local dev:**

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# outputs: STRIPE_WEBHOOK_SECRET=whsec_xxx — paste into .env.local
```

**Production:**
Register `https://yourdomain.com/api/stripe/webhook` in the Stripe Dashboard → Developers → Webhooks.

## `.env.example` (to create)

A `.env.example` file with placeholder values should exist in the repo root so new contributors know what to provide. It should never contain real credentials.
