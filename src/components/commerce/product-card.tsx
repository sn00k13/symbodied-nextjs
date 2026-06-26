"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhotoPlaceholder } from "./photo-placeholder";
import { MapPin, Heart, ShoppingCart } from "lucide-react";
import { naira } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  slug?: string;
  category: string;
  vendor: string;
  price: number;
  unit: string;
  location: string;
  seed?: number;
  image?: string;
  isFavorited?: boolean;
  onAddToCart?: () => void;
  onToggleFavorite?: () => void;
  className?: string;
}

export function ProductCard({ id, name, slug, category, vendor, price, unit, location, seed = 0, image, isFavorited = false, onAddToCart, onToggleFavorite, className }: ProductCardProps) {
  return (
    <div className={cn("group bg-white rounded-xl border border-ink-200 shadow-[var(--shadow-sm)] overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5", className)}>
      <div className="relative aspect-[4/3] overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <PhotoPlaceholder seed={seed} label={category} />
        )}
        <button
          aria-label={isFavorited ? "Unsave" : "Save"}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite?.(); }}
          className={cn(
            "absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors duration-200 shadow-sm z-20",
            isFavorited ? "text-error" : "text-ink-500 hover:text-error"
          )}
        >
          <Heart size={16} fill={isFavorited ? "currentColor" : "none"} />
        </button>
        <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3 z-10">
          <Button variant="gold" size="sm" fullWidth leadingIcon={<ShoppingCart size={15} />} onClick={onAddToCart}>
            Add to Cart
          </Button>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <Badge tone="brand" size="sm" className="self-start">{category}</Badge>
        {slug ? (
          <Link href={`/shop/${slug}`} className="font-sans font-semibold text-sm text-ink leading-snug line-clamp-1 hover:text-brand transition-colors duration-200">
            {name}
          </Link>
        ) : (
          <h3 className="font-sans font-semibold text-sm text-ink leading-snug line-clamp-1">{name}</h3>
        )}
        <p className="text-xs text-ink-500 font-sans">{vendor}</p>
        <div className="flex items-baseline justify-between mt-1">
          <span className="font-display font-bold text-lg text-brand">{naira(price)}</span>
          <span className="text-xs text-ink-500 font-sans">/ {unit}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-ink-500 font-sans">
          <MapPin size={11} />
          {location}
        </div>
      </div>
    </div>
  );
}
