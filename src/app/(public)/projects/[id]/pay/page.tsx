import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PayClient } from "./pay-client";

const VALID_METHODS = ["stripe", "flutterwave", "paystack", "bank_transfer"];
const VALID_CURRENCIES = ["NGN", "USD", "EUR", "GBP", "CAD", "GHS", "KES"];

export default async function DonationPayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ method?: string; amount?: string; currency?: string }>;
}) {
  const { id } = await params;
  const { method, amount: rawAmount, currency = "NGN" } = await searchParams;

  // Validate params
  const amount = rawAmount ? Number(rawAmount) : 0;
  if (!method || !VALID_METHODS.includes(method) || amount <= 0 || !VALID_CURRENCIES.includes(currency)) {
    redirect("/projects");
  }

  const supabase = await createClient();

  // Auth guard
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/projects/${id}/pay?method=${method}&amount=${amount}&currency=${currency}`);

  // Fetch project
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, status")
    .eq("id", id)
    .in("status", ["active", "completed"])
    .maybeSingle();

  if (!project) notFound();

  return (
    <div className="min-h-screen bg-ink-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand font-sans transition-colors mb-6"
        >
          <ArrowLeft size={15} /> Back to Projects
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-brand px-6 py-5">
            <p className="text-xs text-white/70 font-sans uppercase tracking-wide mb-1">Donation checkout</p>
            <h1 className="font-display font-bold text-xl text-white line-clamp-2">
              {project.name as string}
            </h1>
          </div>

          {/* Payment client */}
          <div className="p-6">
            <PayClient
              projectId={id}
              projectName={project.name as string}
              method={method}
              amount={amount}
              currency={currency}
            />
          </div>

          {/* Footer */}
          <div className="border-t border-ink-200 px-6 py-4 flex items-center justify-center gap-2 text-xs text-ink-400 font-sans">
            <Lock size={11} />
            Payments are encrypted and processed securely
          </div>
        </div>
      </div>
    </div>
  );
}
