"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return null;
  return supabase;
}

export async function updateProductStatus(productId: string, status: string) {
  const supabase = await assertAdmin();
  if (!supabase) return { error: "Unauthorized" };
  await supabase.from("products").update({ status }).eq("id", productId);
  revalidatePath("/admin/products");
  return { success: true };
}

export async function updateBlogStatus(blogId: string, status: string) {
  const supabase = await assertAdmin();
  if (!supabase) return { error: "Unauthorized" };
  await supabase.from("blogs").update({ status }).eq("id", blogId);
  revalidatePath("/admin/approvals");
  return { success: true };
}

export async function adminUpdateOrderStatus(orderId: string, status: string) {
  const supabase = await assertAdmin();
  if (!supabase) return { error: "Unauthorized" };
  await supabase.from("orders").update({ status }).eq("id", orderId);
  revalidatePath("/admin/orders");
  return { success: true };
}
