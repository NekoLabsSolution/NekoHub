# Architecture Overview

## High-Level Structure

```
Browser
  └─ Next.js App Router (src/app/)
       ├─ Server Components   — data fetching, DB access
       ├─ Client Components   — interactivity, Stripe.js
       └─ API Routes (route.ts) — webhooks, payment intents, mutations

Server
  ├─ Prisma Client ──────────── Neon PostgreSQL (serverless, pooled)
  └─ Stripe SDK (server-only) ─ Payments, Connect, Webhooks

External
  ├─ Stripe     — payment processing, Connect payouts, webhook events
  ├─ Neon       — managed serverless PostgreSQL
  └─ (TBD)      — file storage, email
```

## Request Flow

### Produtor — Onboarding

```
Usuário autenticado → clica "Tornar-se Produtor" (dashboard)
  → becomeProducer Server Action (src/app/actions/producer.ts)
    → [idempotente] verifica se Producer já existe
    → se não existe:
        → stripe.accounts.create({ type: "express", country: "BR" })
        → prisma.$transaction:
            → Producer.create({ userId, stripeAccountId })
            → User.update({ role: PRODUCER })
        → createSession(userId, "PRODUCER") — atualiza cookie
    → stripe.accountLinks.create({ type: "account_onboarding" })
    → redirect(accountLink.url) — abre fluxo hospedado do Stripe
  → Stripe redireciona para /dashboard/onboarding/return
    → OnboardingReturnPage verifica chargesEnabled + payoutsEnabled
    → exibe status (concluído ou em análise)
  → [se link expirar] GET /api/stripe/connect/refresh
    → gera novo AccountLink e redireciona
  → Stripe envia webhook account.updated → POST /api/stripe/webhook
    → verifica assinatura com STRIPE_WEBHOOK_SECRET
    → WebhookLog garante idempotência (stripeEventId único)
    → Producer.updateMany({ chargesEnabled, payoutsEnabled, kycVerified })
```

### Sign Up

```
Visitor → GET /signup
  → renders SignUpPage (Client Component, MUI form)
  → submits form → signUp Server Action (src/app/actions/auth.ts)
    → Zod validates fields
    → bcrypt hashes password (cost 12)
    → prisma.user.create() — role defaults to BUYER
    → createSession(userId, role) → sets HttpOnly JWT cookie (jose, 7d)
    → redirect("/dashboard")
  → middleware allows /dashboard (session cookie present)
  → GET /dashboard → DashboardPage (Server Component)
    → getSession() verifies JWT from cookie
    → renders onboarding UI (MUI)
```

### Session Verification (proxy)

```
Every request → src/proxy.ts
  → reads "nekohub_session" cookie
  → decrypt(token) via jose
  → if authenticated + hitting /signup or /login → redirect /dashboard
  → if unauthenticated + hitting /dashboard/* → redirect /signup
  → otherwise → pass through
```

### Checkout (one-time purchase)

```
Buyer → POST /api/orders
  → create Order (PENDING) in DB
  → create PaymentIntent in Stripe
  → return client_secret
  → Stripe.js confirms payment in browser
  → Stripe fires payment_intent.succeeded webhook
  → POST /api/stripe/webhook
    → verify signature
    → look up Order by stripePaymentIntentId
    → set Order.status = PAID
    → create/activate ProductAccess
    → log WebhookLog as PROCESSED
```

### Subscription checkout

```
Buyer → POST /api/subscriptions
  → create Stripe Checkout Session or Subscription
  → Stripe fires invoice.paid
  → webhook handler creates/updates Subscription
  → ProductAccess granted
```

### Producer payout

```
Stripe → collects platform fee via application_fee_amount on PaymentIntent
       → transfers remaining amount to Producer's connected account (acct_xxx)
```

## Key Architectural Decisions

| Decision     | Choice                | Rationale                                              |
| ------------ | --------------------- | ------------------------------------------------------ |
| ORM          | Prisma 7              | Type-safe, migration tooling, Neon adapter             |
| Database     | Neon PostgreSQL       | Serverless, scales to zero, direct URL for migrations  |
| Payments     | Stripe                | PIX + Boleto + card, Connect for multi-party payouts   |
| Hosting      | (TBD — likely Vercel) | Native Next.js support                                 |
| Auth         | Custom JWT (jose)     | Stateless, edge-compatible, no external dependency     |
| Password     | bcryptjs (cost 12)    | Industry standard, no native module required           |
| UI           | MUI v7 + Tailwind v4  | MUI for components, Tailwind for layout utilities      |
| Validation   | zod                   | Schema-first, Server Action compatible                 |
| File storage | **Pending**           | `storageUrl` field in ContentItem is provider-agnostic |
| Email        | **Pending**           | No mailer integrated yet                               |

## Module Boundaries

- `src/lib/stripe/server.ts` — server-only; never import in client components
- `src/lib/stripe/client.ts` — browser-only; never import in Server Components or API routes
- `src/lib/prisma.ts` — singleton; always use this, never instantiate PrismaClient directly
- `src/lib/session.ts` — `createSession`/`getSession`/`deleteSession` use `next/headers` (server only); `decrypt` is edge-compatible and used by proxy

## Scalability Notes

- Neon pooled URL used at runtime; direct URL used only for migrations (`prisma.config.ts`)
- `WebhookLog.stripeEventId` unique constraint is the idempotency fence for all webhook processing
- `ProductAccess` acts as the access-control gate — check `isActive` and `expiresAt` before serving content
- All monetary amounts in integer cents; `iofCents` tracks Brazilian IOF tax separately per order

## Open Architecture Questions

- Authentication provider (affects session handling in Server Components and middleware)
- CDN/storage strategy for `ContentItem.storageUrl` (signed URLs, DRM, streaming)
- Admin dashboard: separate Next.js app vs route group vs third-party tool
- Search: database full-text vs external index (Typesense, Algolia)
- Real-time: polling vs Server-Sent Events vs WebSockets for dashboard metrics
