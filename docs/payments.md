# Payments & Stripe

## Stripe SDK Versions
- Server: `stripe` 22.0.2 — API version `2026-03-25.dahlia`
- Client: `@stripe/stripe-js` 9.2.0

## Stripe Products in Use

| Feature | Stripe Resource |
|---|---|
| Payment processing | PaymentIntent |
| Subscriptions | Subscription + Invoice |
| Producer payouts | Connect (Express/Standard) |
| Platform fee | `application_fee_amount` on PaymentIntent |
| Affiliate payout | Stripe Transfer (`tr_xxx`) |
| PIX payments | PaymentIntent with `payment_method_types: ["pix"]` |
| Boleto | PaymentIntent with `payment_method_types: ["boleto"]` |

## Server vs Client Boundaries

| File | Environment | Contents |
|---|---|---|
| `src/lib/stripe/server.ts` | Server only | `Stripe` instance initialized with `STRIPE_SECRET_KEY` |
| `src/lib/stripe/client.ts` | Browser only | `loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)` promise |

**Rule**: never cross these boundaries. Importing `server.ts` in a client component will expose the secret key.

## Webhook Handler (to implement)

Route: `POST /api/stripe/webhook`

```typescript
// Pattern to follow:
const sig = request.headers.get("stripe-signature")!;
const raw = await request.text(); // must be raw bytes, not parsed JSON
const event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
```

### Events to Handle

| Event | Action |
|---|---|
| `payment_intent.succeeded` | Set `Order.status = PAID`, create/activate `ProductAccess`, log `PROCESSED` |
| `payment_intent.payment_failed` | Set `Order.status = FAILED` |
| `charge.dispute.created` | Set `Order.status = CHARGEBACK` |
| `customer.subscription.updated` | Sync `Subscription.status` and period dates |
| `customer.subscription.deleted` | Set `CANCELLED`, set `ProductAccess.isActive = false` |
| `invoice.paid` | Extend `Subscription.currentPeriodEnd` |
| `invoice.payment_failed` | Set `Subscription.status = PAST_DUE` |
| `account.updated` | Update `Producer.kycVerified` or `Affiliate.kycVerified` |

### Idempotency

Before processing any event:
1. Attempt `WebhookLog` insert with `stripeEventId` (unique constraint)
2. If insert fails (duplicate), return `200` immediately — already processed
3. Process event inside a transaction
4. Update `WebhookLog.status = PROCESSED` (or `FAILED` on error)

## Fee Calculation (Order creation)

At checkout, compute and persist:
```
amountCents          = Price.amountCents
platformFeeCents     = amountCents × platformFeeRate   (rate TBD)
affiliateCommCents   = amountCents × Affiliate.commissionRate (if referral present)
iofCents             = amountCents × 0.035             (if applicable)
producerNetCents     = amountCents - platformFeeCents - affiliateCommCents - iofCents
```

All values locked at order creation time to avoid drift if rates change.

## PIX-Specific Fields on Order

- `pixQrCode` — EMV QR code payload (text)
- `pixQrCodeExpiry` — expiration timestamp; must be checked before displaying QR

## Connect Payout Flow

1. Producer creates account via Stripe Connect onboarding (Express or Standard)
2. `Producer.stripeAccountId` stores `acct_xxx`
3. When payment is collected, platform sets `application_fee_amount` — Stripe automatically routes the remainder to the connected account
4. KYC verified via `account.updated` webhook → `Producer.kycVerified = true`

## Affiliate Commission Payout

1. `Commission` record created on order paid (`stripeTransferId = null`)
2. Platform approves commission → creates Stripe Transfer to `Affiliate.stripeAccountId`
3. `Commission.stripeTransferId = tr_xxx`, `status = PAID`
4. On order refund/chargeback → `Commission.status = REVERSED`

## Current State (verified)

- `src/lib/stripe/server.ts` ✅ initialized correctly, throws on missing key
- `src/lib/stripe/client.ts` ✅ initialized correctly, throws on missing key
- `src/app/api/stripe/test/route.ts` ✅ sanity-check route (balance retrieve)
- Webhook handler ❌ not yet implemented
- Checkout flow ❌ not yet implemented
- Connect onboarding ❌ not yet implemented

## Security Rules

- Always call `stripe.webhooks.constructEvent()` — never process events without signature verification
- The raw request body must be passed to `constructEvent`, not the parsed JSON
- `STRIPE_WEBHOOK_SECRET` must come from environment, never hardcoded
- Return `400` only on signature failure; return `200` on all other outcomes (including already-processed) to prevent Stripe retries
