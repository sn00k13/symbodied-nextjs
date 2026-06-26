"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/commerce/product-card";
import { toggleFavorite } from "@/app/actions/favorites";

export type SavedProduct = {
  id: string;
  slug?: string;
  name: string;
  category: string;
  vendor: string;
  price: number;
  unit: string;
  location: string;
  image?: string;
  seed?: number;
};

interface SavedGridProps {
  initialProducts: SavedProduct[];
}

export function SavedGrid({ initialProducts }: SavedGridProps) {
  const [products, setProducts] = useState(initialProducts);

  async function handleRemove(productId: string) {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    await toggleFavorite(productId);
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-ink-400 font-sans text-center py-12">
        No saved items yet. Browse the{" "}
        <Link href="/shop" className="text-brand hover:underline">shop</Link>{" "}
        and tap the heart on any product to save it here.
      </p>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          {...p}
          isFavorited={true}
          onToggleFavorite={() => handleRemove(p.id)}
        />
      ))}
    </div>
  );
}
