"use client";

import { ProductCard } from "@/components/commerce/product-card";
import { useCart } from "@/store/cart";
import { toast } from "sonner";

export type VendorProduct = {
  id: string;
  name: string;
  slug?: string;
  category: string;
  vendor: string;
  price: number;
  unit: string;
  location: string;
  seed: number;
  image?: string;
};

interface VendorProductsProps {
  products: VendorProduct[];
}

export function VendorProducts({ products }: VendorProductsProps) {
  const addItem = useCart((s) => s.addItem);

  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink-400 font-sans text-sm">No products listed yet.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          {...p}
          onAddToCart={() => {
            addItem({ id: p.id, name: p.name, price: p.price, unit: p.unit, vendor: p.vendor, seed: p.seed });
            toast.success(`${p.name.slice(0, 30)}… added to cart`);
          }}
        />
      ))}
    </div>
  );
}
