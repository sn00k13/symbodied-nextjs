"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const priceRaw = parseFloat(formData.get("price") as string);
  const unit = (formData.get("unit") as string)?.trim();
  const stock = parseInt(formData.get("stock") as string, 10);
  const location = (formData.get("location") as string)?.trim() || null;
  const status = (formData.get("status") as string) === "draft" ? "draft" : "pending";
  const imageFile = formData.get("image") as File | null;

  if (!name || !category || !unit) return { error: "Name, category, and unit are required." };
  if (isNaN(priceRaw) || priceRaw < 0) return { error: "Enter a valid price." };
  if (isNaN(stock) || stock < 0) return { error: "Enter a valid stock quantity." };

  let image_url: string | null = null;
  if (imageFile && imageFile.size > 0) {
    try {
      image_url = await uploadToCloudinary(imageFile, "symbodied/products");
    } catch {
      // non-fatal
    }
  }

  // ensure unique slug
  const baseSlug = slugify(name);
  const slug = `${baseSlug}-${Date.now()}`;

  const { error } = await supabase.from("products").insert({
    user_id: user.id,
    name,
    slug,
    category,
    description,
    price: priceRaw,
    unit,
    stock,
    location,
    image_url,
    status,
  });

  if (error) return { error: error.message };

  revalidatePath("/studio/products");
  redirect("/studio/products");
}
