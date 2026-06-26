"use client";

import Link from "next/link";
import { Mail, Lock, User, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const firstName = form.get("first_name") as string;
    const lastName = form.get("last_name") as string;
    const username = (form.get("username") as string).trim().toLowerCase();
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const role = (form.get("role") as string) || "user";

    if (!username) {
      toast.error("Username is required.");
      return;
    }
    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      toast.error("Username must be 3–30 characters: letters, numbers, or underscores only.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, role, username },
      },
    });

    if (error) {
      setLoading(false);
      if (error.message.includes("rate_limit") || error.status === 429) {
        toast.error("Too many requests. Please wait a moment before trying again.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    setLoading(false);
    setDone(true);
    toast.success("Account created! Check your email to verify.");
  };

  if (done) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="font-display font-bold text-3xl text-ink tracking-tight">Check your email</h1>
        <p className="text-ink-600 font-sans text-base">
          We sent a confirmation link to your inbox. Click it to activate your account, then{" "}
          <Link href="/login" className="text-brand font-semibold hover:underline">sign in</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display font-bold text-3xl text-ink tracking-tight">Join Symbodied</h1>
        <p className="mt-2 text-ink-600 font-sans text-base">
          Create an account to buy, sell, donate, and connect with your community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First name"
            name="first_name"
            type="text"
            placeholder="Ada"
            required
            leadingIcon={<User size={16} />}
          />
          <Input
            label="Last name"
            name="last_name"
            type="text"
            placeholder="Obi"
            required
          />
        </div>
        <Input
          label="Username"
          name="username"
          type="text"
          placeholder="ada_obi"
          required
          autoComplete="username"
          leadingIcon={<AtSign size={16} />}
          helper="3–30 characters. Letters, numbers, and underscores only. Must be unique."
        />
        <Input
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          leadingIcon={<Mail size={16} />}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Min. 8 characters"
          required
          minLength={8}
          autoComplete="new-password"
          helper="Use at least 8 characters with a mix of letters and numbers."
          leadingIcon={<Lock size={16} />}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink font-sans">Account type</label>
          <select
            name="role"
            required
            defaultValue="user"
            className="w-full px-3 py-2.5 border border-ink-300 rounded-lg text-sm font-sans text-ink bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          >
            <option value="user">User — shop, donate, and explore</option>
            <option value="vendor">Vendor — sell products and publish content</option>
          </select>
        </div>
        <p className="text-xs text-ink-500 font-sans">
          By signing up you agree to our{" "}
          <Link href="/terms" className="text-brand hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-brand hover:underline">Privacy Policy</Link>.
        </p>
        <Button type="submit" variant="gold" size="lg" fullWidth loading={loading}>
          Create Account
        </Button>
      </form>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-ink-200" />
        <span className="text-xs text-ink-400 font-sans">or</span>
        <div className="flex-1 h-px bg-ink-200" />
      </div>

      <Button variant="secondary" size="lg" fullWidth>Continue with Google</Button>

      <p className="text-center text-sm text-ink-500 font-sans">
        Already have an account?{" "}
        <Link href="/login" className="text-brand font-semibold hover:text-brand-hover transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
