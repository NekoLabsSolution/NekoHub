# NekoHub — Copilot & Agent Instructions

## Project Overview

NekoHub is a digital products marketplace (SaaS) inspired by Hotmart and Kirvano.
Creators sell digital products (courses, ebooks, memberships, software, services) to buyers. Payments are processed via Stripe.

## Verified Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **Database**: Neon PostgreSQL via `@prisma/adapter-neon`
- **ORM**: Prisma 7 with `prisma.config.ts` for migration wiring
- **Payments**: Stripe 22 (server SDK) + `@stripe/stripe-js` 9 (client SDK)
- **Styling**: Tailwind CSS v4 + PostCSS + **MUI (Material UI v7)** + `@emotion/react`
- **UI Components**: `@mui/material` + `@mui/icons-material` — all frontend UI uses MUI; no emoji
- **Auth**: Custom stateless JWT sessions via `jose` + `bcryptjs` for password hashing
- **Validation**: `zod`
- **Linting**: ESLint 9 (`eslint-config-next` with TypeScript rules)

> Next.js 16 has breaking changes. Read `node_modules/next/dist/docs/` before writing any Next.js-specific code.

## Directory Conventions

```
src/
  app/             # Next.js App Router pages and API routes
    (auth)/        # Auth pages — /signup, /login
    (dashboard)/   # Authenticated pages — /dashboard
    actions/       # Server Actions (auth.ts, …)
    api/           # Route handlers (route.ts)
    lib/           # App-local types/schemas (definitions.ts)
  components/      # Shared UI components (ThemeRegistry, …)
  lib/             # Shared utilities
    prisma.ts      # Singleton Prisma client (Neon adapter)
    session.ts     # JWT session: encrypt / decrypt / createSession / getSession / deleteSession
    stripe/
      server.ts    # Server-only Stripe instance
      client.ts    # Browser Stripe promise (NEXT_PUBLIC key)
  proxy.ts         # Edge proxy — auth-gate for /dashboard, redirect on /signup if authenticated
prisma/
  schema.prisma    # Single source of truth for data model
  migrations/      # Locked migration files — never edit manually
  config.ts        # prisma.config.ts — strips pooler for migrations
docs/              # Project documentation
.github/           # GitHub config and Copilot instructions
```

## Database Domains (schema.prisma)

| Model                           | Purpose                                                              |
| ------------------------------- | -------------------------------------------------------------------- |
| `User`                          | Authentication, roles (BUYER / PRODUCER / ADMIN), Stripe customer ID |
| `Producer`                      | Stripe Connect account, KYC state, payout schedule                   |
| `Product`                       | Listings with status lifecycle and Stripe product ID                 |
| `Price`                         | One-time or recurring prices linked to Stripe price IDs              |
| `Order`                         | Purchase record with full fee breakdown (platform, affiliate, IOF)   |
| `Subscription`                  | Recurring billing state synced from Stripe                           |
| `Affiliate`                     | Referral program per product with commission rate                    |
| `Commission`                    | Per-order payout tracking for affiliates                             |
| `ProductAccess`                 | Grants and revokes buyer access (one-time or subscription)           |
| `ContentModule` / `ContentItem` | Course/product content hierarchy                                     |
| `WebhookLog`                    | Idempotent log of all incoming Stripe events                         |

## Coding Rules

- Never import `src/lib/stripe/server.ts` in client components or browser bundles.
- Never import `src/lib/stripe/client.ts` in Server Components or API routes.
- All monetary values are stored in **integer cents** (e.g. 9700 = R$97,00).
- Always use `prisma` singleton from `src/lib/prisma.ts`; never instantiate `PrismaClient` directly.
- Use `gen_random_uuid()` as the DB default for IDs — do not generate UUIDs in application code for new records.
- Role checks must happen server-side; never trust client-sent role values.
- Stripe webhook handlers must verify the signature with `stripe.webhooks.constructEvent`.
- Use `stripeEventId` uniqueness in `WebhookLog` as the idempotency guard — process each event exactly once.

## Critical Stripe Events to Handle

```
payment_intent.succeeded          → set Order PAID, grant ProductAccess
payment_intent.payment_failed     → set Order FAILED
charge.dispute.created            → set Order CHARGEBACK
customer.subscription.updated     → sync Subscription.status
customer.subscription.deleted     → set CANCELLED, revoke ProductAccess
invoice.paid                      → extend currentPeriodEnd
invoice.payment_failed            → set PAST_DUE
account.updated (Connect)         → update Producer/Affiliate kycVerified
```

## Required Environment Variables

| Variable                             | Usage                                                             |
| ------------------------------------ | ----------------------------------------------------------------- |
| `DATABASE_URL`                       | Neon pooled connection string                                     |
| `STRIPE_SECRET_KEY`                  | Server-side Stripe SDK (`sk_…`)                                   |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side Stripe.js (`pk_…`)                                    |
| `STRIPE_WEBHOOK_SECRET`              | Webhook signature verification (`whsec_…`)                        |
| `SESSION_SECRET`                     | 32-byte random secret for JWT signing (`openssl rand -base64 32`) |

## Open Decisions (do not implement without clarification)

- File/content storage provider (S3, Bunny CDN, Cloudflare R2?)
- Email delivery service (Resend, SendGrid, AWS SES?)
- Admin dashboard approach (separate app or route group?)
- Search and discovery strategy
- Multi-currency scope beyond BRL

## Security Checklist (apply to every PR)

- [ ] No secrets in source code or committed `.env` files
- [ ] Stripe webhook signature verified before processing
- [ ] Role-based access enforced server-side
- [ ] CPF / PII not logged or exposed in responses
- [ ] SQL injections prevented (Prisma parameterizes all queries)
- [ ] File upload endpoints validate type and size
