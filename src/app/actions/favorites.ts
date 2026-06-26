"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(productId: string): Promise<{ favorited: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { favorited: false };

  const { data: existing } = await supabase
    .from("saved_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase.from("saved_items").delete().eq("id", existing.id);
    revalidatePath("/dashboard/saved");
    return { favorited: false };
  } else {
    await supabase.from("saved_items").insert({ user_id: user.id, product_id: productId });
    revalidatePath("/dashboard/saved");
    return { favorited: true };
  }
}
