# Development Conventions

## Language & Tooling

- TypeScript 5, strict mode (`"strict": true` in tsconfig)
- ESLint 9 with `eslint-config-next/core-web-vitals` and `/typescript`
- No Prettier config yet — add before first team PR

## Naming

| Construct | Convention | Example |
|---|---|---|
| React components | PascalCase | `ProductCard`, `CheckoutForm` |
| Functions / variables | camelCase | `createOrder`, `platformFeeCents` |
| API route files | `route.ts` in folder | `app/api/orders/route.ts` |
| DB table names | snake_case (via `@@map`) | `product_access` |
| DB column names | camelCase (Prisma maps) | `stripeCustomerId` |
| Enums (DB) | SCREAMING_SNAKE | `BUYER`, `ONE_TIME`, `PAST_DUE` |
| Env variables | SCREAMING_SNAKE | `STRIPE_SECRET_KEY` |

## File Structure (target)

```
src/
  app/
    (marketing)/        # Public pages (landing, pricing)
    (auth)/             # Login, register, verify
    (buyer)/            # Buyer dashboard, library, orders
    (producer)/         # Producer dashboard, product management
    (admin)/            # Admin panel (role-gated)
    api/
      stripe/
        webhook/        # route.ts — Stripe event handler
      orders/           # route.ts
      products/         # route.ts
      ...
  lib/
    prisma.ts           # DB singleton
    stripe/
      server.ts         # Server Stripe client
      client.ts         # Browser Stripe promise
  components/           # Shared UI components
  hooks/                # Shared React hooks
  types/                # Shared TypeScript types
```

## Monetary Values

- **Always integer cents** — `amountCents: 9700` = R$97,00
- Display only: divide by 100 and use `Intl.NumberFormat`
- Never perform arithmetic on float representations

## API Routes

- Use Next.js Route Handlers (`route.ts`) in `app/api/`
- Always return typed `NextResponse.json()`
- Validate request bodies with a schema library (zod recommended — not yet added)
- Authentication check before any DB access
- Role check server-side; never trust client-supplied role

## Database Access

- Use `prisma` singleton from `src/lib/prisma.ts`
- Never instantiate `PrismaClient` directly
- Wrap multi-step DB operations in `prisma.$transaction()`
- Use `select` or `omit` to avoid over-fetching

## Error Handling

- API routes: return structured `{ error: string }` with appropriate HTTP status
- Webhook handler: log error to `WebhookLog.errorMessage`, return `200` to prevent Stripe retries unless signature fails (return `400`)

## Git Conventions (pending team decision)

- Branch naming: `feat/`, `fix/`, `chore/`, `docs/`
- Commit messages: conventional commits format (`feat: add order creation endpoint`)
- PR size: keep focused; one domain per PR

## What Not to Do

- Do not commit `.env` files or secrets
- Do not instantiate `PrismaClient` outside `src/lib/prisma.ts`
- Do not import `stripe/server.ts` in client bundles
- Do not store monetary values as floats
- Do not trust user-supplied `role` values in API requests
- Do not skip webhook signature verification
