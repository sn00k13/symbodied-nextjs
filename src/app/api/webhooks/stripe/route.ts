import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/payments/stripe";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const donationId = session.metadata?.donation_id;

    if (donationId && session.payment_status === "paid") {
      await markDonationComplete(donationId, session.payment_intent as string ?? session.id);
    }
  }

  return NextResponse.json({ received: true });
}

async function markDonationComplete(donationId: string, ref: string) {
  const db = createServiceClient();

  const { data: donation } = await db
    .from("donations")
    .select("amount, project_id, status")
    .eq("id", donationId)
    .maybeSingle();

  if (!donation || donation.status === "completed") return;

  await db
    .from("donations")
    .update({ status: "completed", reference: ref })
    .eq("id", donationId);

  const { data: project } = await db
    .from("projects")
    .select("raised")
    .eq("id", donation.project_id)
    .maybeSingle();

  if (project) {
    await db
      .from("projects")
      .update({ raised: Number(project.raised ?? 0) + Number(donation.amount) })
      .eq("id", donation.project_id);
  }
}
