import { createClient } from "@/lib/supabase/server";
import { ShopClient, type ShopProduct } from "@/components/commerce/shop-client";
import { products as STATIC_PRODUCTS } from "@/lib/data";

export default async function ShopPage() {
  const supabase = await createClient();

  const [{ data: rawProducts }, { data: { user } }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, category, price, unit, location, image_url, profiles(first_name, last_name)")
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  const liveProducts: ShopProduct[] = (rawProducts ?? []).map((p, i) => {
    const prof = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
    const firstName = (prof as { first_name?: string } | null)?.first_name ?? "";
    const lastName = (prof as { last_name?: string } | null)?.last_name ?? "";
    const vendor = [firstName, lastName].filter(Boolean).join(" ") || "Symbodied Vendor";
    return {
      id: p.id as string,
      name: p.name as string,
      slug: (p.slug as string | null) ?? undefined,
      category: p.category as string,
      price: Number(p.price),
      unit: p.unit as string,
      location: (p.location as string) ?? "",
      image: (p.image_url as string | null) ?? undefined,
      vendor,
      seed: i,
    };
  });

  const products = liveProducts.length > 0 ? liveProducts : STATIC_PRODUCTS;

  const initialFavorites: string[] = [];
  if (user) {
    const { data: saved } = await supabase
      .from("saved_items")
      .select("product_id")
      .eq("user_id", user.id);
    (saved ?? []).forEach((s) => {
      if (s.product_id) initialFavorites.push(s.product_id as string);
    });
  }

  return <ShopClient products={products} initialFavorites={initialFavorites} />;
}
