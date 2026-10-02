"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe/server";
import { getSession, createSession } from "@/lib/session";

export type ProducerOnboardingState = { error?: string } | undefined;

function buildBaseUrl(host: string): string {
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";
  return `${proto}://${host}`;
}

export async function becomeProducer(
  _state: ProducerOnboardingState,
  _formData: FormData,
): Promise<ProducerOnboardingState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const host = (await headers()).get("host") ?? "localhost:3000";
  const baseUrl = buildBaseUrl(host);

  // Idempotent — reuse the existing Stripe account if the user already started
  const existing = await prisma.producer.findUnique({
    where: { userId: session.userId },
    select: { stripeAccountId: true },
  });

  let stripeAccountId: string;

  if (existing) {
    stripeAccountId = existing.stripeAccountId;
  } else {
    const account = await stripe.accounts
      .create({
        type: "express",
        country: "BR",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })
      .catch(() => null);

    if (!account) {
      return { error: "Não foi possível conectar ao Stripe. Tente novamente." };
    }

    stripeAccountId = account.id;

    await prisma.$transaction(async (tx) => {
      await tx.producer.create({
        data: { userId: session.userId, stripeAccountId },
      });
      await tx.user.update({
        where: { id: session.userId },
        data: { role: "PRODUCER" },
      });
    });

    // Refresh session so the role cookie reflects PRODUCER
    await createSession(session.userId, "PRODUCER");
  }

  const link = await stripe.accountLinks
    .create({
      account: stripeAccountId,
      refresh_url: `${baseUrl}/api/stripe/connect/refresh`,
      return_url: `${baseUrl}/dashboard/onboarding/return`,
      type: "account_onboarding",
    })
    .catch(() => null);

  if (!link) {
    return {
      error: "Não foi possível gerar o link de cadastro. Tente novamente.",
    };
  }

  redirect(link.url);
}
