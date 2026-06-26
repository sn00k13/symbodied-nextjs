"use server";

import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/payments/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export type InitPaymentInput = {
  projectId: string;
  amount: number;
  currency: string;
  method: string;
};

export type InitPaymentResult =
  | { url: string }
  | { bankTransfer: true; donationId: string; currency: string }
  | { error: string };

export async function initializePayment(input: InitPaymentInput): Promise<InitPaymentResult> {
  const { projectId, amount, currency, method } = input;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to donate." };

  // Create pending donation record
  const { data: donation, error: donErr } = await supabase
    .from("donations")
    .insert({ project_id: projectId, user_id: user.id, amount, currency, payment_method: method, status: "pending" })
    .select("id")
    .single();

  if (donErr || !donation) {
    console.error("Donation insert error:", donErr);
    return { error: "Could not record donation. Please try again." };
  }

  const donationId = donation.id as string;
  const successBase = `${APP_URL}/projects/${projectId}/pay/success`;
  const cancelUrl   = `${APP_URL}/projects/${projectId}/pay/cancel?donation_id=${donationId}`;

  // ── Stripe ──────────────────────────────────────────────────────────────
  if (method === "stripe") {
    try {
      const session = await getStripe().checkout.sessions.create({
        mode: "payment",
        line_items: [{
          price_data: {
            currency: currency.toLowerCase(),
            product_data: { name: "Symbodied Project Donation" },
            unit_amount: Math.round(amount * 100), // cents
          },
          quantity: 1,
        }],
        metadata: { donation_id: donationId, project_id: projectId },
        success_url: `${successBase}?session_id={CHECKOUT_SESSION_ID}&donation_id=${donationId}`,
        cancel_url: cancelUrl,
      });
      if (!session.url) return { error: "Stripe session creation failed." };
      return { url: session.url };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Stripe error." };
    }
  }

  // ── Flutterwave ──────────────────────────────────────────────────────────
  if (method === "flutterwave") {
    try {
      const res = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` },
        body: JSON.stringify({
          tx_ref: `donation-${donationId}`,
          amount,
          currency,
          redirect_url: `${successBase}?provider=flutterwave&donation_id=${donationId}`,
          customer: { email: user.email },
          customizations: { title: "Symbodied Donation", description: "Project donation" },
          meta: { donation_id: donationId, project_id: projectId },
        }),
      });
      const json = await res.json();
      if (json.status !== "success") return { error: json.message ?? "Flutterwave error." };
      return { url: json.data.link };
    } catch {
      return { error: "Could not reach Flutterwave. Please try again." };
    }
  }

  // ── Paystack ─────────────────────────────────────────────────────────────
  if (method === "paystack") {
    try {
      const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
        body: JSON.stringify({
          email: user.email,
          amount: Math.round(amount * 100), // kobo / pesewas
          currency,
          reference: `donation-${donationId}`,
          callback_url: `${successBase}?provider=paystack&donation_id=${donationId}`,
          metadata: { donation_id: donationId, project_id: projectId },
        }),
      });
      const json = await res.json();
      if (!json.status) return { error: json.message ?? "Paystack error." };
      return { url: json.data.authorization_url };
    } catch {
      return { error: "Could not reach Paystack. Please try again." };
    }
  }

  // ── Bank Transfer ────────────────────────────────────────────────────────
  if (method === "bank_transfer") {
    return { bankTransfer: true, donationId, currency };
  }

  return { error: "Unknown payment method." };
}
