"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function donateToProject(projectId: string, amount: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (!amount || amount <= 0) return { error: "Enter a valid donation amount." };

  const { error } = await supabase.from("donations").insert({
    project_id: projectId,
    user_id: user.id,
    amount,
    status: "pending",
  });

  if (error) return { error: error.message };

  // Update raised amount
  const { data: proj } = await supabase.from("projects").select("raised").eq("id", projectId).single();
  const current = Number((proj as { raised: number } | null)?.raised ?? 0);
  await supabase.from("projects").update({ raised: current + amount }).eq("id", projectId);

  revalidatePath("/projects");
  return { success: true };
}

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const summary = (formData.get("summary") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const target = parseFloat(formData.get("target") as string);
  const daysLeft = parseInt(formData.get("days_left") as string, 10) || 30;

  if (!name || !category) return { error: "Name and category are required." };
  if (isNaN(target) || target <= 0) return { error: "Enter a valid funding target." };

  const { error } = await supabase.from("projects").insert({
    user_id: user.id,
    name, category, summary, description,
    target, days_left: daysLeft,
    status: "pending",
  });

  if (error) return { error: error.message };

  revalidatePath("/projects");
  return { success: true };
}
