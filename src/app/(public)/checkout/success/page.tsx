import Link from "next/link";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center px-6 py-16">
      <div className="h-20 w-20 rounded-full bg-success-bg flex items-center justify-center">
        <CheckCircle size={40} className="text-success-green" />
      </div>
      <div>
        <h1 className="font-display font-bold text-3xl text-ink mb-2">Order Placed!</h1>
        <p className="text-ink-600 font-sans text-base max-w-sm mx-auto">
          Your order has been recorded. You&apos;ll receive a confirmation once the vendor processes it.
        </p>
        {order && (
          <p className="mt-3 text-xs text-ink-400 font-sans font-mono">
            Order ID: {order}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Link href="/shop">
          <Button variant="primary" leadingIcon={<ShoppingBag size={16} />}>Continue Shopping</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="secondary">View Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
