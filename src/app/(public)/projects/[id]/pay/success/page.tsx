import Link from "next/link";
import { CheckCircle2, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/payments/stripe";

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦", USD: "$", EUR: "€", GBP: "£", CAD: "CA$", GHS: "GH₵", KES: "KSh",
};

async function verifyAndComplete(sp: URLSearchParams): Promise<{ ok: boolean; amount?: number; currency?: string; projectId?: string }> {
  const db = createServiceClient();
  const donationId = sp.get("donation_id");
  const provider = sp.get("provider"); // flutterwave | paystack
  const sessionId = sp.get("session_id"); // stripe

  if (!donationId) return { ok: false };

  // Fetch existing donation
  const { data: donation } = await db
    .from("donations")
    .select("id, amount, currency, project_id, status")
    .eq("id", donationId)
    .maybeSingle();

  if (!donation) return { ok: false };

  // Already completed (e.g. webhook fired first)
  if ((donation.status as string) === "completed") {
    return { ok: true, amount: Number(donation.amount), currency: donation.currency as string, projectId: donation.project_id as string };
  }

  let verified = false;
  let ref = "";

  // ── Stripe ──────────────────────────────────────────────────────────────
  if (sessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      verified = session.payment_status === "paid";
      ref = (session.payment_intent as string) ?? sessionId;
    } catch {
      return { ok: false };
    }
  }

  // ── Flutterwave ──────────────────────────────────────────────────────────
  else if (provider === "flutterwave") {
    const txId = sp.get("transaction_id");
    const status = sp.get("status");
    if (txId && status === "successful") {
      try {
        const res = await fetch(`https://api.flutterwave.com/v3/transactions/${txId}/verify`, {
          headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` },
        });
        const json = await res.json();
        verified = json.status === "success" && json.data?.status === "successful";
        ref = txId;
      } catch {
        return { ok: false };
      }
    }
  }

  // ── Paystack ──────────────────────────────────────────────────────────────
  else if (provider === "paystack") {
    const reference = sp.get("reference") ?? sp.get("trxref");
    if (reference) {
      try {
        const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
          headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
        });
        const json = await res.json();
        verified = json.status && json.data?.status === "success";
        ref = reference;
      } catch {
        return { ok: false };
      }
    }
  }

  if (!verified) return { ok: false };

  // Mark donation as completed
  await db.from("donations").update({ status: "completed", reference: ref }).eq("id", donationId);

  // Increment project raised amount
  const { data: project } = await db
    .from("projects")
    .select("raised")
    .eq("id", donation.project_id as string)
    .maybeSingle();

  if (project) {
    await db
      .from("projects")
      .update({ raised: Number(project.raised ?? 0) + Number(donation.amount) })
      .eq("id", donation.project_id as string);
  }

  return { ok: true, amount: Number(donation.amount), currency: donation.currency as string, projectId: donation.project_id as string };
}

export default async function DonationSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { id } = await params;
  const sp = new URLSearchParams(await searchParams as Record<string, string>);
  const result = await verifyAndComplete(sp);
  const sym = CURRENCY_SYMBOLS[result.currency ?? "NGN"] ?? (result.currency ?? "");

  if (!result.ok) {
    return (
      <div className="min-h-screen bg-ink-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-error-bg flex items-center justify-center mx-auto mb-5">
            <Heart size={28} className="text-error" />
          </div>
          <h1 className="font-display font-bold text-2xl text-ink mb-2">Payment could not be verified</h1>
          <p className="text-sm text-ink-500 font-sans mb-6">
            If your payment went through, it will be reflected within a few minutes. Check your email or contact{" "}
            <a href="mailto:support@symbodied.org" className="text-brand hover:underline">support@symbodied.org</a>.
          </p>
          <Link href={`/projects`}>
            <Button variant="secondary" fullWidth>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={28} className="text-success-green" />
        </div>

        <h1 className="font-display font-bold text-2xl text-ink mb-2">Thank you!</h1>
        <p className="text-sm text-ink-500 font-sans mb-1">Your donation of</p>
        {result.amount && (
          <p className="font-display font-bold text-3xl text-brand mb-1">
            {sym}{result.amount.toLocaleString()}
            <span className="text-base font-sans font-normal text-ink-500 ml-1">{result.currency}</span>
          </p>
        )}
        <p className="text-sm text-ink-500 font-sans mb-8">has been received and confirmed.</p>

        <div className="flex flex-col gap-3">
          <Link href={`/projects`}>
            <Button variant="gold" fullWidth leadingIcon={<Heart size={15} />}>
              Support More Projects
            </Button>
          </Link>
          <Link href="/">
            <Button variant="secondary" fullWidth trailingIcon={<ArrowRight size={15} />}>
              Back to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
