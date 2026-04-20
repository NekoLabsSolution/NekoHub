// app/api/stripe/test/route.ts
import { stripe } from "@/lib/stripe/server";
import { NextResponse } from "next/server";

export async function GET() {
  const balance = await stripe.balance.retrieve();
  return NextResponse.json({ currency: balance.available[0].currency });
}
