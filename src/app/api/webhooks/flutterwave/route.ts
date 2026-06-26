import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const hash = req.headers.get("verif-hash");

  // Verify Flutterwave webhook signature
  const expected = crypto
    .createHmac("sha256", process.env.FLUTTERWAVE_SECRET_HASH ?? "")
    .update(body)
    .digest("hex");

  if (hash !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: { event: string; data: { id: number; tx_ref: string; status: string; amount: number; meta?: { donation_id?: string } } };
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.event === "charge.completed" && payload.data.status === "successful") {
    const donationId =
      payload.data.meta?.donation_id ??
      payload.data.tx_ref.replace("donation-", "");

    if (donationId) {
      await markDonationComplete(donationId, String(payload.data.id));
    }
  }

  return NextResponse.json({ status: "ok" });
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
