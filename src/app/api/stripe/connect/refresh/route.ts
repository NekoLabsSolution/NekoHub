import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe/server";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.redirect(new URL("/login", request.url));
  }

  const producer = await prisma.producer.findUnique({
    where: { userId: session.userId },
    select: { stripeAccountId: true },
  });

  if (!producer) {
    return Response.redirect(new URL("/dashboard", request.url));
  }

  const host = request.headers.get("host") ?? "localhost:3000";
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = `${proto}://${host}`;

  const link = await stripe.accountLinks
    .create({
      account: producer.stripeAccountId,
      refresh_url: `${baseUrl}/api/stripe/connect/refresh`,
      return_url: `${baseUrl}/dashboard/onboarding/return`,
      type: "account_onboarding",
    })
    .catch(() => null);

  if (!link) {
    return Response.redirect(new URL("/dashboard", request.url));
  }

  return Response.redirect(link.url);
}
