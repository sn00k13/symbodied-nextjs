"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Star, MapPin, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import Image from "next/image";
import { PhotoPlaceholder } from "@/components/commerce/photo-placeholder";
import { ProductCard } from "@/components/commerce/product-card";
import { SectionHeader } from "@/components/commerce/section-header";
import { useCart } from "@/store/cart";
import { products } from "@/lib/data";
import { naira } from "@/lib/utils";
import { toast } from "sonner";
import { use } from "react";

const TABS = ["Overview", "Description", "Details", "Reviews"];

function vendorSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const addItem = useCart((s) => s.addItem);
  const product = products.find((p) => p.slug === slug) ?? products[0];
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [tab, setTab] = useState("Overview");

  const related = products.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[var(--container-max)] mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-ink-500 font-sans mb-7">
          <Link href="/shop" className="text-brand hover:underline">Shop</Link>
          <ChevronRight size={14} />
          <span>{product.category}</span>
          <ChevronRight size={14} />
          <span className="text-ink font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image gallery */}
          <div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-ink-100">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <PhotoPlaceholder seed={product.seed + imgIdx} />
              )}
            </div>
            <div className="grid grid-cols-4 gap-3 mt-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 bg-ink-100 ${
                    imgIdx === i ? "ring-2 ring-brand ring-offset-2" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="12vw"
                    />
                  ) : (
                    <PhotoPlaceholder seed={product.seed + i} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-5">
            <Badge tone="brand" className="self-start">{product.category}</Badge>
            <h1 className="font-display font-bold text-3xl text-ink leading-tight tracking-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-ink-500 font-sans">
              <span className="flex items-center gap-1.5 text-gold-dark">
                <Star size={15} fill="#F5C518" className="text-gold" />
                4.8 · 126 likes
              </span>
              <span>1,204 views</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-4xl text-brand">{naira(product.price)}</span>
              <span className="text-ink-500 font-sans text-base">/ {product.unit}</span>
              <Badge tone="success" className="ml-2">In Stock</Badge>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-sm text-ink-600 font-sans">
              <MapPin size={15} />{product.location}
            </div>

            {/* Qty + CTA */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center border border-ink-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center text-xl font-semibold bg-ink-100 hover:bg-ink-200 transition-colors text-ink"
                >−</button>
                <span className="w-11 text-center font-semibold font-sans text-ink">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-10 h-11 flex items-center justify-center text-xl font-semibold bg-ink-100 hover:bg-ink-200 transition-colors text-ink"
                >+</button>
              </div>
              <Button
                variant="gold"
                size="lg"
                leadingIcon={<ShoppingCart size={18} />}
                onClick={() => {
                  for (let i = 0; i < qty; i++) addItem({ id: product.id, name: product.name, price: product.price, unit: product.unit, vendor: product.vendor, seed: product.seed });
                  toast.success(`${qty}× added to your cart`);
                }}
              >
                Add to Cart
              </Button>
              <Button variant="secondary" size="lg" leadingIcon={<Heart size={18} />}>Save</Button>
            </div>

            {/* Vendor card */}
            <Card padding="md" className="flex items-center gap-4">
              <Avatar name={product.vendor} size="md" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink font-sans">{product.vendor}</div>
                <div className="text-xs text-ink-500 font-sans">Verified vendor · {product.location}</div>
              </div>
              <Link href={`/vendors/${vendorSlug(product.vendor)}`}>
                <Button variant="ghost" size="sm" trailingIcon={<ChevronRight size={15} />}>View Vendor</Button>
              </Link>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-14">
          <div className="border-b border-ink-200 flex gap-7">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3.5 text-sm font-semibold font-sans transition-colors duration-200 border-b-2 -mb-px ${
                  tab === t
                    ? "text-brand border-brand"
                    : "text-ink-500 border-transparent hover:text-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="mt-6 max-w-2xl text-base text-ink-600 font-sans leading-[1.7]">
            Sourced directly from {product.vendor} in {product.location}, this {product.category.toLowerCase()} product upholds the
            standards our community is known for. Each order supports the cooperative behind it and keeps value within the local economy.
            Carefully harvested, processed, and packaged to the highest standard.
          </p>
        </div>

        {/* Related products */}
        <div className="mt-14">
          <SectionHeader overline="You might also like" title="Related Products" className="mb-7" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
