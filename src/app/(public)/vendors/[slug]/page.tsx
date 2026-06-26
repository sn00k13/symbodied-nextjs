import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, ShoppingBag, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { products as STATIC_PRODUCTS } from "@/lib/data";
import { VendorProducts, type VendorProduct } from "./vendor-products";

// ── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ── Static vendor bios (update or extend as vendors are onboarded) ────────────

const VENDOR_META: Record<string, { tagline: string; bio: string }> = {
  "ngozi-farms": {
    tagline: "Premium grains from Ebonyi",
    bio: "Third-generation farming cooperative based in Abakaliki, renowned for premium long-grain rice. Every bag directly supports over 40 smallholder farmer families.",
  },
  "akwete-weavers-guild": {
    tagline: "Heritage textiles from Abia",
    bio: "The Akwete Weavers Guild preserves a 500-year-old tradition of hand-loom weaving. Each piece is individually crafted by master weavers trained in the ancestral technique.",
  },
  "delta-greens": {
    tagline: "Pure palm products from the Delta",
    bio: "Delta Greens sources organic palm oil directly from smallholder farmers across the Niger Delta, processed without chemicals for maximum purity and flavour.",
  },
  "herbal-roots-co": {
    tagline: "Traditional herbs & botanicals",
    bio: "Herbal Roots Co. documents and distributes traditional Igbo botanical medicine, working with community herbalists to sustainably harvest and package medicinal plants.",
  },
  "ife-staples": {
    tagline: "Quality staples from Osun",
    bio: "Ife Staples processes and packages West African food staples — from premium sieve garri to dried legumes — with rigorous quality standards at every step.",
  },
  "ibadan-indigo": {
    tagline: "Artisan Adire from Oyo",
    bio: "Ìbàdàn Indigo revives the ancient Yoruba tradition of Adire Eleko resist-dye fabric. Each piece is hand-drawn with starch paste and dyed in natural indigo.",
  },
  "brightfield-tech": {
    tagline: "Agritech solutions for smallholders",
    bio: "BrightField Tech designs low-cost, durable technology for smallholder farmers across Nigeria, focused on post-harvest processing and renewable energy.",
  },
  "sahel-naturals": {
    tagline: "Cold-pressed oils from the Sahel",
    bio: "Sahel Naturals produces artisan cold-pressed botanical oils from the Kano region, preserving nutrients and aroma through minimal processing.",
  },
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function VendorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  let vendorName = "";
  let vendorLocation = "";
  let vendorProducts: VendorProduct[] = [];
  let isLive = false;

  // ── Try Supabase: look up profile by username = slug ─────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, username, role")
    .eq("username", slug)
    .maybeSingle();

  if (profile) {
    isLive = true;
    vendorName = `${(profile.first_name as string) ?? ""} ${(profile.last_name as string) ?? ""}`.trim();

    const { data: dbProducts } = await supabase
      .from("products")
      .select("id, name, slug, category, price, unit, location, image_url")
      .eq("user_id", profile.id as string)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    vendorProducts = (dbProducts ?? []).map((p, i) => ({
      id: p.id as string,
      name: p.name as string,
      slug: (p.slug as string | null) ?? undefined,
      category: p.category as string,
      price: Number(p.price),
      unit: p.unit as string,
      location: (p.location as string) ?? "",
      image: (p.image_url as string | null) ?? undefined,
      vendor: vendorName,
      seed: i,
    }));

    vendorLocation = vendorProducts[0]?.location ?? "";
  } else {
    // ── Fallback: match against static product vendor names ──────────────
    const matching = STATIC_PRODUCTS.filter((p) => toSlug(p.vendor) === slug);
    if (matching.length === 0) notFound();

    vendorName = matching[0].vendor;
    vendorLocation = matching[0].location;
    vendorProducts = matching.map((p) => ({ ...p, image: p.image }));
  }

  const meta = VENDOR_META[slug];
  const categories = [...new Set(vendorProducts.map((p) => p.category))];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-brand-deep">
        <div className="max-w-[var(--container-max)] mx-auto px-6 pt-8 pb-12">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white font-sans transition-colors mb-8"
          >
            <ArrowLeft size={15} /> Back to Shop
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar name={vendorName} size="xl" />

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge tone="gold" size="sm">Verified Vendor</Badge>
                {categories.map((c) => (
                  <Badge key={c} tone="neutral" size="sm" className="bg-white/10 text-white/80 border-white/20">
                    {c}
                  </Badge>
                ))}
              </div>
              <h1 className="font-display font-bold text-3xl text-white tracking-tight">{vendorName}</h1>
              {vendorLocation && (
                <div className="flex items-center gap-1.5 text-sm text-white/70 font-sans">
                  <MapPin size={14} /> {vendorLocation}
                </div>
              )}
              {meta?.tagline && (
                <p className="text-sm text-white/60 font-sans italic">{meta.tagline}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[var(--container-max)] mx-auto px-6 py-10">
        {/* Bio + stats */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {meta?.bio && (
            <div className="flex-1">
              <h2 className="font-sans font-bold text-sm text-ink-600 uppercase tracking-wide mb-3">About</h2>
              <p className="text-ink-600 font-sans leading-relaxed">{meta.bio}</p>
            </div>
          )}

          <div className="flex gap-6 lg:gap-8 flex-shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div className="h-12 w-12 rounded-xl bg-brand-light flex items-center justify-center">
                <Package size={22} className="text-brand" />
              </div>
              <span className="font-display font-bold text-2xl text-ink">{vendorProducts.length}</span>
              <span className="text-xs text-ink-500 font-sans">Products</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-12 w-12 rounded-xl bg-gold-light flex items-center justify-center">
                <ShoppingBag size={22} className="text-gold-dark" />
              </div>
              <span className="font-display font-bold text-2xl text-ink">{categories.length}</span>
              <span className="text-xs text-ink-500 font-sans">{categories.length === 1 ? "Category" : "Categories"}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-ink-200 mb-8" />

        {/* Products */}
        <h2 className="font-sans font-bold text-lg text-ink mb-6">
          Products by {vendorName}
        </h2>
        <VendorProducts products={vendorProducts} />
      </div>
    </div>
  );
}
