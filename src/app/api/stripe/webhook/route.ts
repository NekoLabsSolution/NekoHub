import { type NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { prisma } from "@/lib/prisma";

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error(
    "Missing required environment variable: STRIPE_WEBHOOK_SECRET",
  );
}
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return Response.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }

  // Idempotency: skip events already processed
  const existing = await prisma.webhookLog.findUnique({
    where: { stripeEventId: event.id },
    select: { status: true },
  });
  if (existing?.status === "PROCESSED") {
    return Response.json({ received: true });
  }

  // Log the event as PENDING before processing
  await prisma.webhookLog.upsert({
    where: { stripeEventId: event.id },
    update: {},
    create: {
      stripeEventId: event.id,
      eventType: event.type,
      payload: JSON.parse(JSON.stringify(event)),
      status: "PENDING",
    },
  });

  let finalStatus: "PROCESSED" | "IGNORED" = "IGNORED";
  let errorMessage: string | undefined;

  try {
    finalStatus = await handleEvent(event);
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Unknown error";
  }

  if (errorMessage) {
    await prisma.webhookLog.update({
      where: { stripeEventId: event.id },
      data: {
        status: "FAILED",
        errorMessage,
        retryCount: { increment: 1 },
      },
    });
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  await prisma.webhookLog.update({
    where: { stripeEventId: event.id },
    data: {
      status: finalStatus,
      processedAt: finalStatus === "PROCESSED" ? new Date() : undefined,
    },
  });

  return Response.json({ received: true });
}

async function handleEvent(
  event: Stripe.Event,
): Promise<"PROCESSED" | "IGNORED"> {
  switch (event.type) {
    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      await prisma.producer.updateMany({
        where: { stripeAccountId: account.id },
        data: {
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          kycVerified: account.details_submitted,
        },
      });
      return "PROCESSED";
    }

    default:
      return "IGNORED";
  }
}
