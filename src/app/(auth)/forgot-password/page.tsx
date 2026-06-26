"use client";

import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const email = (new FormData(e.currentTarget).get("email") as string) ?? "";
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    setSent(true);
    toast.success("Reset link sent! Check your inbox.");
  };

  if (sent) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <div className="h-16 w-16 rounded-full bg-brand-light flex items-center justify-center text-brand mx-auto">
          <Mail size={28} />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Check your email</h1>
          <p className="mt-2 text-ink-600 font-sans text-sm leading-relaxed max-w-xs mx-auto">
            We've sent a password reset link. It may take a minute to arrive.
          </p>
        </div>
        <Link href="/login"><Button variant="secondary" fullWidth>Back to Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand font-sans mb-6 transition-colors">
          <ArrowLeft size={15} /> Back to Sign In
        </Link>
        <h1 className="font-display font-bold text-3xl text-ink tracking-tight">Forgot your password?</h1>
        <p className="mt-2 text-ink-600 font-sans text-base">Enter your email and we'll send you a reset link.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input name="email" label="Email address" type="email" placeholder="you@example.com" required autoComplete="email" leadingIcon={<Mail size={16} />} />
        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>Send Reset Link</Button>
      </form>
    </div>
  );
}
