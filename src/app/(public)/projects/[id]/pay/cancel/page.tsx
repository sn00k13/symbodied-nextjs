import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createServiceClient } from "@/lib/supabase/service";

export default async function DonationCancelPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ donation_id?: string }>;
}) {
  const { id } = await params;
  const { donation_id } = await searchParams;

  // Mark the pending donation as failed so it doesn't stay in limbo
  if (donation_id) {
    const db = createServiceClient();
    await db
      .from("donations")
      .update({ status: "failed" })
      .eq("id", donation_id)
      .eq("status", "pending");
  }

  return (
    <div className="min-h-screen bg-ink-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-warning-bg flex items-center justify-center mx-auto mb-5">
          <RotateCcw size={28} className="text-warning" />
        </div>

        <h1 className="font-display font-bold text-2xl text-ink mb-2">Payment cancelled</h1>
        <p className="text-sm text-ink-500 font-sans mb-8">
          No charge was made. You can go back and try again whenever you&apos;re ready.
        </p>

        <div className="flex flex-col gap-3">
          <Link href={`/projects`}>
            <Button variant="gold" fullWidth leadingIcon={<RotateCcw size={15} />}>
              Try Again
            </Button>
          </Link>
          <Link href="/" className="inline-flex items-center justify-center gap-1.5 text-sm text-ink-500 hover:text-brand font-sans transition-colors">
            <ArrowLeft size={13} /> Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
