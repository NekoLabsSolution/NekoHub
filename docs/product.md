# Product & Business Overview

## What is NekoHub?

A marketplace for digital products. Creators publish and sell; buyers discover and access. The platform takes a fee on each transaction, similar to Hotmart and Kirvano.

## Actors

| Actor | Description |
|---|---|
| **Buyer** | Purchases and accesses products |
| **Producer** | Creates, prices, and sells products; receives payouts via Stripe Connect |
| **Affiliate** | Promotes products via referral code; earns commission per sale |
| **Admin** | Manages users, disputes, moderation, and platform reporting |

## Product Types

`COURSE` · `EBOOK` · `MEMBERSHIP` · `SOFTWARE` · `SERVICE`

## Pricing Models

- **ONE_TIME** — single purchase, lifetime or expiry-based access
- **RECURRING** — subscription with interval (day / week / month / year), optional trial

## Payment Methods (Brazil-focused)

- **CARD** — credit/debit via Stripe
- **PIX** — instant Brazilian payment; QR code stored in `Order.pixQrCode`
- **BOLETO** — Brazilian bank slip

## Money Flow

```
Buyer pays full price
  → Stripe deducts platform fee (application_fee_amount)
  → Stripe deducts affiliate commission (manual Transfer or application fee split)
  → Remainder transferred to Producer's Stripe Connect account
```

Fee fields on `Order`: `amountCents`, `platformFeeCents`, `affiliateCommissionCents`, `iofCents`, `producerNetCents`

## Core Lifecycle States

### Product
`DRAFT → ACTIVE ↔ PAUSED → ARCHIVED`

### Order
`PENDING → PROCESSING → PAID`
`PENDING → CANCELLED`
`PAID → REFUNDED`
`PAID → CHARGEBACK`
`PROCESSING → FAILED`

### Subscription
`INCOMPLETE → TRIALING → ACTIVE → PAST_DUE → CANCELLED`
`ACTIVE → PAUSED`
`ACTIVE → UNPAID → INCOMPLETE_EXPIRED`

### Affiliate
`PENDING → ACTIVE ↔ SUSPENDED`
`PENDING → REJECTED`

### Commission
`PENDING → APPROVED → PAID`
`APPROVED → REVERSED`

## Access Control

`ProductAccess` is the single gate for buyer access:
- Created on `payment_intent.succeeded` (one-time) or `invoice.paid` (subscription)
- Revoked (`isActive = false`) on `customer.subscription.deleted`
- `expiresAt = null` means lifetime access

## KYC (Producer Verification)

- `Producer.kycVerified` set via `account.updated` Stripe Connect webhook
- Payouts should be gated behind `kycVerified = true`

## Key Business Rules

1. Platform fee calculated at order creation time and stored on the order
2. IOF (3.5%) applied to Brazilian buyers transacting with foreign-entity sellers
3. Affiliate referral code must be validated at checkout; commission locked to order
4. One affiliate entry per (user, product) pair — `@@unique([userId, productId])`
5. Producers need a Stripe Connect account before products can go ACTIVE

## Open Product Questions

- What is the platform fee percentage? (not yet defined in code)
- Are coupons/discount codes in scope?
- Is there a free-tier product model (lead magnet)?
- Producer dashboard: analytics depth, payout history display?
- Buyer portal: download management, certificate generation?
- Refund policy enforcement (manual vs automatic)?
