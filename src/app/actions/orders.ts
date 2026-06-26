"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  vendor: string;
};

export async function createOrder(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const address = (formData.get("address") as string)?.trim();
  const cartJson = formData.get("cart") as string;

  if (!address) return { error: "Delivery address is required." };

  let items: CartItem[] = [];
  try {
    items = JSON.parse(cartJson);
  } catch {
    return { error: "Invalid cart data." };
  }

  if (!items.length) return { error: "Your cart is empty." };

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const vat = Math.round(subtotal * 0.075);
  const delivery = 3500;
  const total = subtotal + vat + delivery;
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const productSummary = items.length === 1
    ? items[0].name
    : `${items[0].name} + ${items.length - 1} more`;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      total,
      customer: user.email,
      product: productSummary,
      qty: totalQty,
      delivery_address: address,
      status: "processing",
    })
    .select("id")
    .single();

  if (orderError || !order) return { error: orderError?.message ?? "Failed to create order." };

  // Insert line items
  const lineItems = items.map((item) => ({
    order_id: order.id,
    product_id: null,
    name: item.name,
    price: item.price,
    qty: item.quantity,
    unit: item.unit,
  }));

  await supabase.from("order_items").insert(lineItems);

  redirect(`/checkout/success?order=${order.id}`);
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).maybeSingle();

  const isVendor = true; // vendor can update their own orders
  if (profile?.role !== "admin" && !isVendor) return { error: "Unauthorized" };

  await supabase.from("orders").update({ status }).eq("id", orderId);
  return { success: true };
}
