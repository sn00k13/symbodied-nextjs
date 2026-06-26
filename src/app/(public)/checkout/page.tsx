"use client";

import { useTransition, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { naira } from "@/lib/utils";
import { createOrder } from "@/app/actions/orders";

const DELIVERY = 3500;
const VAT = 0.075;

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 text-center px-6">
        <ShoppingBag size={48} className="text-ink-300" />
        <h2 className="font-display font-bold text-2xl text-ink">Nothing to check out</h2>
        <Link href="/shop"><Button variant="primary">Browse Shop</Button></Link>
      </div>
    );
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const vat = Math.round(subtotal * VAT);
  const total = subtotal + vat + DELIVERY;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("cart", JSON.stringify(items));
    startTransition(async () => {
      const result = await createOrder(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="bg-ink-100 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand font-sans transition-colors mb-6">
          <ArrowLeft size={15} /> Back to Cart
        </Link>

        <h1 className="font-display font-bold text-3xl text-ink mb-8 tracking-tight">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
            {/* Delivery details */}
            <div className="bg-white rounded-xl border border-ink-200 p-6 flex flex-col gap-5">
              <h2 className="font-sans font-bold text-lg text-ink flex items-center gap-2">
                <MapPin size={18} /> Delivery Details
              </h2>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-ink font-sans">Full Name</label>
                <input name="name" required placeholder="Your full name"
                  className="w-full h-11 px-4 rounded-lg border border-ink-200 font-sans text-sm text-ink bg-white placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-ink font-sans">Phone Number</label>
                <input name="phone" required placeholder="e.g. 08012345678" type="tel"
                  className="w-full h-11 px-4 rounded-lg border border-ink-200 font-sans text-sm text-ink bg-white placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-ink font-sans">Delivery Address</label>
                <textarea name="address" required rows={3} placeholder="Street address, city, state"
                  className="w-full px-4 py-3 rounded-lg border border-ink-200 font-sans text-sm text-ink bg-white placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-ink font-sans">Delivery Notes <span className="font-normal text-ink-400">(optional)</span></label>
                <input name="notes" placeholder="e.g. call on arrival"
                  className="w-full h-11 px-4 rounded-lg border border-ink-200 font-sans text-sm text-ink bg-white placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all" />
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-xl border border-ink-200 p-6 sticky top-24">
              <h2 className="font-sans font-bold text-lg text-ink mb-4">Order Summary</h2>

              <div className="flex flex-col gap-2 mb-4 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm font-sans">
                    <span className="text-ink-600 line-clamp-1 flex-1 mr-2">{item.name} × {item.quantity}</span>
                    <span className="font-semibold text-ink shrink-0">{naira(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-ink-200 pt-3 flex flex-col gap-2 text-sm font-sans">
                <div className="flex justify-between text-ink-600">
                  <span>Subtotal</span><span className="font-semibold text-ink">{naira(subtotal)}</span>
                </div>
                <div className="flex justify-between text-ink-600">
                  <span>Delivery</span><span className="font-semibold text-ink">{naira(DELIVERY)}</span>
                </div>
                <div className="flex justify-between text-ink-600">
                  <span>VAT (7.5%)</span><span className="font-semibold text-ink">{naira(vat)}</span>
                </div>
                <div className="border-t border-ink-200 pt-2 flex justify-between">
                  <span className="font-bold text-ink">Total</span>
                  <span className="font-display font-bold text-xl text-brand">{naira(total)}</span>
                </div>
              </div>

              {error && <p className="mt-3 text-sm text-error font-sans">{error}</p>}

              <p className="mt-4 text-xs text-ink-400 font-sans text-center">
                Payment processing will be enabled soon. Your order will be recorded and confirmed.
              </p>

              <Button type="submit" variant="gold" size="lg" fullWidth loading={pending} className="mt-4">
                Place Order
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
