import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { Logo } from "@/components/layout/logo";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const { token } = await searchParams;

  let status: "success" | "invalid" | "error" | "already" = "invalid";

  if (token) {
    const supabase = createServiceClient();
    const { data: subscriber } = await supabase
      .from("subscribers")
      .select("id, status")
      .eq("unsubscribe_token", token)
      .maybeSingle();

    if (!subscriber) {
      status = "invalid";
    } else if (subscriber.status === "unsubscribed") {
      status = "already";
    } else {
      const { error } = await supabase
        .from("subscribers")
        .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
        .eq("unsubscribe_token", token);
      status = error ? "error" : "success";
    }
  }

  const messages = {
    success: {
      emoji: "✓",
      heading: "You've been unsubscribed.",
      body: "We're sorry to see you go. You won't receive any more emails from us.",
    },
    already: {
      emoji: "·",
      heading: "Already unsubscribed.",
      body: "This email is no longer on our list. No further action needed.",
    },
    invalid: {
      emoji: "✕",
      heading: "Link not recognised.",
      body: "This unsubscribe link is invalid or has already been used.",
    },
    error: {
      emoji: "!",
      heading: "Something went wrong.",
      body: "We couldn't process your request right now. Please try again later.",
    },
  };

  const msg = messages[status];

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Logo inverse height={28} />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-10">
          <div
            className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold ${
              status === "success" || status === "already"
                ? "bg-brand/20 text-brand-light"
                : "bg-error/20 text-error"
            }`}
          >
            {msg.emoji}
          </div>
          <h1 className="font-display text-2xl font-bold text-white">{msg.heading}</h1>
          <p className="mt-3 font-sans text-sm leading-relaxed text-white/55">{msg.body}</p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-gold px-6 text-sm font-semibold text-ink font-sans hover:bg-gold-mid transition-colors"
            >
              Return to Symbodied
            </Link>
            {status !== "success" && (
              <p className="text-xs text-white/35 font-sans">
                Subscribed by mistake?{" "}
                <Link href="/" className="underline text-white/55 hover:text-white/75">
                  Re-subscribe from the homepage.
                </Link>
              </p>
            )}
          </div>
        </div>

        <p className="mt-8 text-xs text-white/25 font-sans">
          © 2026 Symbodied LLC
        </p>
      </div>
    </div>
  );
}
