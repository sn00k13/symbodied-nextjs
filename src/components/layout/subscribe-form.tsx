"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribed(true);
        toast.success("Subscribed! Check your inbox for a confirmation.");
      } else {
        toast.error(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <p className="mt-6 text-sm font-sans text-brand-light">
        ✓ You&apos;re subscribed — check your inbox!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        required
        disabled={loading}
        className="flex-1 h-11 px-4 rounded-lg border border-white/15 bg-white/6 text-white text-sm font-sans placeholder:text-white/40 focus:outline-none focus:border-brand disabled:opacity-50"
      />
      <Button type="submit" variant="gold" size="md" loading={loading}>
        Subscribe
      </Button>
    </form>
  );
}
