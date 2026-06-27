import { createClient } from "@/lib/supabase/server";
import { SavedGrid, type SavedProduct } from "./saved-grid";

export default async function SavedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: savedItems } = await supabase
    .from("saved_items")
    .select("id, products(id, slug, name, category, price, unit, location, image_url, profiles(first_name, last_name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  type RawItem = {
    products?: {
      id: string; slug?: string | null; name: string; category: string;
      price: number; unit: string; location: string | null; image_url?: string | null;
      profiles?: { first_name?: string | null; last_name?: string | null } | { first_name?: string | null; last_name?: string | null }[] | null;
    } | null;
  };

  const products: SavedProduct[] = (savedItems ?? [])
    .flatMap((item) => {
      const p = (item as unknown as RawItem).products;
      if (!p) return [];
      const prof = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
      const vendor = [prof?.first_name ?? "", prof?.last_name ?? ""].filter(Boolean).join(" ") || "Symbodied Vendor";
      const mapped: SavedProduct = {
        id: p.id,
        name: p.name,
        category: p.category,
        vendor,
        price: Number(p.price),
        unit: p.unit,
        location: p.location ?? "",
        ...(p.slug ? { slug: p.slug } : {}),
        ...(p.image_url ? { image: p.image_url } : {}),
      };
      return [mapped];
    });

  return (
    <div className="p-7 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-sans font-bold text-xl text-ink">Saved Items</h2>
        <span className="text-sm text-ink-500 font-sans">
          <strong className="text-ink">{products.length}</strong> saved
        </span>
      </div>
      <SavedGrid initialProducts={products} />
    </div>
  );
}
