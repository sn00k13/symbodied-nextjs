import { createClient } from "@/lib/supabase/server";
import { SavedGrid, type SavedProduct } from "./saved-grid";

export default async function SavedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: savedItems } = await supabase
    .from("saved_items")
    .select("id, products(id, slug, name, category, price, unit, location, vendor, image)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const products: SavedProduct[] = (savedItems ?? [])
    .map((item) => {
      const raw = item as unknown as { products?: SavedProduct | SavedProduct[] | null };
      const p = Array.isArray(raw.products) ? raw.products[0] : raw.products;
      return p ?? null;
    })
    .filter((p): p is SavedProduct => p !== null);

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
