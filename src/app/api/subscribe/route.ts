import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/service";
import { subscribeConfirmationHtml } from "@/lib/email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email: string = (body.email ?? "").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("subscribers")
    .select("id, status, unsubscribe_token")
    .eq("email", email)
    .maybeSingle();

  if (existing?.status === "active") {
    return NextResponse.json({ error: "This email is already subscribed." }, { status: 409 });
  }

  let token: string;

  if (existing) {
    const { data, error } = await supabase
      .from("subscribers")
      .update({ status: "active", unsubscribed_at: null, subscribed_at: new Date().toISOString() })
      .eq("email", email)
      .select("unsubscribe_token")
      .single();
    if (error) return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 });
    token = data.unsubscribe_token;
  } else {
    const { data, error } = await supabase
      .from("subscribers")
      .insert({ email })
      .select("unsubscribe_token")
      .single();
    if (error) return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 });
    token = data.unsubscribe_token;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://symbodied.com";
  const unsubscribeUrl = `${appUrl}/unsubscribe?token=${token}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Symbodied <newsletter@symbodied.com>",
    to: email,
    subject: "You're subscribed to Symbodied",
    html: subscribeConfirmationHtml({ email, unsubscribeUrl }),
  });

  return NextResponse.json({ success: true });
}
