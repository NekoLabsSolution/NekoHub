# Testing Strategy

## Current State

No test suite exists yet. The codebase has:
- `src/app/api/stripe/test/route.ts` — a manual dev sanity check (not a test)
- No test runner configured
- No test files

## Recommended Setup

### Test Runner
**Vitest** is recommended for this stack:
- Compatible with TypeScript, ESM, and Next.js
- Fast, Jest-compatible API
- Works alongside the existing ESLint/TypeScript config

```bash
npm install -D vitest @vitejs/plugin-react
```

### Testing Layers

| Layer | What to test | Tool |
|---|---|---|
| Unit | Fee calculations, utility functions, enum logic | Vitest |
| Integration | API route handlers with mocked DB/Stripe | Vitest + `msw` or Stripe test mode |
| E2E | Full checkout flows, auth flows | Playwright |

## Priority Test Areas

### 1. Fee Calculation (unit)
The `platformFeeCents`, `affiliateCommissionCents`, `iofCents`, `producerNetCents` calculation must be deterministic and correct. Pure function — easy to unit-test.

### 2. Webhook Handler (integration)
- Valid signature → processes event → correct DB mutation
- Duplicate `stripeEventId` → returns 200, no reprocessing
- Invalid signature → returns 400
- Use Stripe's `stripe.webhooks.generateTestHeaderString()` to create valid test signatures

### 3. Order Creation (integration)
- Correct fee breakdown persisted
- `ProductAccess` created on `PAID` transition
- Affiliate commission locked at creation

### 4. Role-Based Access (unit/integration)
- BUYER cannot access producer routes
- PRODUCER cannot access admin routes
- Unauthenticated requests rejected

### 5. ProductAccess Gate (unit)
- `isActive = false` blocks access
- Expired `expiresAt` blocks access
- Active subscription grants access

## Stripe Testing

- Use Stripe test mode keys (`sk_test_…`, `pk_test_…`)
- Use Stripe test card numbers (e.g. `4242 4242 4242 4242`)
- Use `stripe trigger <event>` CLI to fire test webhooks locally
- Never run tests against live Stripe keys

## Database in Tests

Options (pick one before implementing):
1. **Neon branch per test run** — isolated, real PostgreSQL (preferred)
2. **Prisma mock** (`jest-mock-extended` or vitest mock) — fast, no DB needed
3. **Test database** — separate DB instance, reset before each test suite

## What to Avoid

- Do not test Prisma internals or Stripe SDK internals
- Do not use production DB or live Stripe keys in any test
- Do not commit test snapshots of sensitive data
