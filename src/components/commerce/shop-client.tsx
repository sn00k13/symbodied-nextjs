"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown, Search } from "lucide-react";
import { ProductCard } from "@/components/commerce/product-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/store/cart";
import { naira } from "@/lib/utils";
import { toast } from "sonner";
import { toggleFavorite } from "@/app/actions/favorites";

export type ShopProduct = {
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

const CATEGORIES = ["All", "Agriculture", "Textile", "Medicine", "Technology"];
const LOCATIONS = ["Nigeria", "Ghana", "Kenya", "Diaspora"];
const SORTS = ["Newest", "Price: Low → High", "Price: High → Low", "Most Popular"];

// Derive country from location string. All locations currently follow "City, State" (Nigerian).
// Extend this map as products from other countries are added.
function getProductCountry(location: string): string {
  const lower = location.toLowerCase();
  if (lower.includes("ghana") || lower.includes("accra")) return "Ghana";
  if (lower.includes("kenya") || lower.includes("nairobi")) return "Kenya";
  if (
    lower.includes("diaspora") ||
    lower.includes("united kingdom") ||
    lower.includes("united states") ||
    lower.includes("london") ||
    lower.includes("new york")
  ) return "Diaspora";
  return "Nigeria";
}
const PRICE_MIN_BOUND = 0;
const PRICE_MAX_BOUND = 100000;

interface ShopClientProps {
  products: ShopProduct[];
  initialFavorites?: string[];
  isAuthenticated?: boolean;
}

export function ShopClient({ products, initialFavorites = [], isAuthenticated = false }: ShopClientProps) {
  const addItem = useCart((s) => s.addItem);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set(initialFavorites));
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLocations, setActiveLocations] = useState<Set<string>>(new Set());
  const [activeSort, setActiveSort] = useState("Newest");
  const [search, setSearch] = useState("");
  const [priceMin, setPriceMin] = useState(PRICE_MIN_BOUND);
  const [priceMax, setPriceMax] = useState(PRICE_MAX_BOUND);

  function toggleLocation(loc: string) {
    setActiveLocations((prev) => {
      const next = new Set(prev);
      if (next.has(loc)) next.delete(loc);
      else next.add(loc);
      return next;
    });
  }

  const minPct = (priceMin / PRICE_MAX_BOUND) * 100;
  const maxPct = (priceMax / PRICE_MAX_BOUND) * 100;

  const filtered = products
    .filter((p) => {
      const matchCat = activeCategory === "All" || p.category === activeCategory;
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.vendor.toLowerCase().includes(search.toLowerCase());
      const matchPrice = p.price >= priceMin && p.price <= priceMax;
      const matchLocation =
        activeLocations.size === 0 || activeLocations.has(getProductCountry(p.location));
      return matchCat && matchSearch && matchPrice && matchLocation;
    })
    .sort((a, b) => {
      if (activeSort === "Price: Low → High") return a.price - b.price;
      if (activeSort === "Price: High → Low") return b.price - a.price;
      return 0;
    });

  async function handleToggleFavorite(productId: string) {
    if (!isAuthenticated) {
      toast.error("Sign in to save products", { description: "Create a free account or log in to save products for later." });
      return;
    }
    const isCurrentlyFavorited = favorites.has(productId);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
    const result = await toggleFavorite(productId);
    if (result.favorited !== !isCurrentlyFavorited) {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (result.favorited) next.add(productId);
        else next.delete(productId);
        return next;
      });
    }
    toast.success(result.favorited ? "Saved!" : "Removed from saved", {
      description: result.favorited ? "Find it anytime in your dashboard." : undefined,
    });
  }

  function clearFilters() {
    setActiveCategory("All");
    setActiveLocations(new Set());
    setSearch("");
    setPriceMin(PRICE_MIN_BOUND);
    setPriceMax(PRICE_MAX_BOUND);
  }

  return (
    <div className="bg-ink-100 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-ink-200">
        <div className="max-w-[var(--container-max)] mx-auto px-6 py-10">
          <h1 className="font-display font-bold text-4xl text-ink tracking-tight">Shop the Marketplace</h1>
          <p className="mt-2 text-ink-600 font-sans text-base">
            Fresh produce, heritage textiles, and more — direct from vendors across the diaspora.
          </p>
          <div className="mt-6 max-w-lg">
            <Input
              placeholder="Search products, vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leadingIcon={<Search size={16} />}
            />
          </div>
        </div>
      </div>

      <div className="max-w-[var(--container-max)] mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8 items-start">
          {/* Sidebar filters */}
          <Card padding="lg" className="lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-ink font-sans mb-4 flex items-center gap-2">
              <SlidersHorizontal size={16} /> Filters
            </h3>

            {/* Category */}
            <div className="pb-5 mb-5 border-b border-ink-200">
              <h4 className="text-xs font-bold text-ink-600 uppercase tracking-wide mb-3 font-sans">Category</h4>
              {CATEGORIES.map((c) => (
                <label key={c} className="flex items-center gap-3 py-1.5 cursor-pointer text-sm font-sans text-ink-600 hover:text-ink">
                  <span
                    onClick={() => setActiveCategory(c)}
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                      activeCategory === c ? "bg-brand border-brand" : "border-ink-300 bg-white"
                    }`}
                  >
                    {activeCategory === c && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </span>
                  <span className="flex-1" onClick={() => setActiveCategory(c)}>{c}</span>
                  <span className="text-ink-400 text-xs">
                    {c === "All" ? products.length : products.filter((p) => p.category === c).length}
                  </span>
                </label>
              ))}
            </div>

            {/* Price range */}
            <div className="pb-5 mb-5 border-b border-ink-200">
              <h4 className="text-xs font-bold text-ink-600 uppercase tracking-wide mb-3 font-sans">Price Range</h4>
              <div className="relative h-6 mx-1 my-2">
                <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-ink-200 rounded-full">
                  <div
                    className="absolute inset-y-0 bg-brand rounded-full"
                    style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={PRICE_MIN_BOUND}
                  max={PRICE_MAX_BOUND}
                  step={500}
                  value={priceMin}
                  onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax - 500))}
                  className="range-thumb absolute inset-0 w-full h-full"
                  style={{ zIndex: priceMin > PRICE_MAX_BOUND - 2000 ? 5 : 3 }}
                />
                <input
                  type="range"
                  min={PRICE_MIN_BOUND}
                  max={PRICE_MAX_BOUND}
                  step={500}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin + 500))}
                  className="range-thumb absolute inset-0 w-full h-full"
                  style={{ zIndex: 4 }}
                />
              </div>
              <div className="flex justify-between text-xs text-ink-500 font-sans mt-1">
                <span>{naira(priceMin)}</span>
                <span>{naira(priceMax)}</span>
              </div>
            </div>

            {/* Location */}
            <div className="pb-5 mb-5 border-b border-ink-200">
              <h4 className="text-xs font-bold text-ink-600 uppercase tracking-wide mb-3 font-sans">Location</h4>
              {LOCATIONS.map((l) => {
                const checked = activeLocations.has(l);
                const count = products.filter((p) => getProductCountry(p.location) === l).length;
                return (
                  <label
                    key={l}
                    onClick={() => toggleLocation(l)}
                    className="flex items-center gap-3 py-1.5 cursor-pointer text-sm font-sans text-ink-600 hover:text-ink"
                  >
                    <span
                      className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                        checked ? "bg-brand border-brand" : "border-ink-300 bg-white"
                      }`}
                    >
                      {checked && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </span>
                    <span className="flex-1">{l}</span>
                    <span className="text-ink-400 text-xs">{count}</span>
                  </label>
                );
              })}
            </div>

            <Button variant="secondary" size="sm" fullWidth onClick={clearFilters}>
              Clear filters
            </Button>
          </Card>

          {/* Product grid */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm text-ink-500 font-sans">
                <strong className="text-ink">{filtered.length}</strong> products
              </span>
              <div className="relative flex items-center gap-2 text-sm font-sans text-ink-600">
                Sort:
                <select
                  value={activeSort}
                  onChange={(e) => setActiveSort(e.target.value)}
                  className="appearance-none font-semibold text-ink bg-transparent cursor-pointer pr-5 outline-none"
                >
                  {SORTS.map((s) => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-0 pointer-events-none" />
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((p) => (
                  <ProductCard
                    key={p.id}
                    {...p}
                    isFavorited={favorites.has(p.id)}
                    onToggleFavorite={() => handleToggleFavorite(p.id)}
                    onAddToCart={() => {
                      addItem({ id: p.id, name: p.name, price: p.price, unit: p.unit, vendor: p.vendor, seed: p.seed });
                      toast.success(`${p.name.slice(0, 30)}… added to cart`);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="h-16 w-16 rounded-full bg-brand-light flex items-center justify-center text-brand">
                  <Search size={28} />
                </div>
                <h3 className="font-sans font-bold text-lg text-ink">No products found</h3>
                <p className="text-ink-500 font-sans text-sm max-w-xs">Try adjusting your search or filters to find what you&apos;re looking for.</p>
                <Button variant="secondary" size="sm" onClick={clearFilters}>Clear filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
