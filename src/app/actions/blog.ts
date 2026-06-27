"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createBlogPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const title = (formData.get("title") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const excerpt = (formData.get("excerpt") as string)?.trim() || null;
  const content = (formData.get("content") as string)?.trim();
  const image_url = (formData.get("image_url") as string)?.trim() || null;

  if (!title || !category || !content) return { error: "Title, category, and content are required." };

  const { error } = await supabase.from("blogs").insert({
    user_id: user.id,
    title,
    category,
    excerpt,
    content,
    image_url,
    status: "pending",
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/blog-posts");
  redirect("/dashboard/blog-posts");
}

export async function toggleBlogLike(blogId: string, type: "like" | "dislike") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: existing } = await supabase
    .from("blog_likes")
    .select("id, type")
    .eq("blog_id", blogId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    if (existing.type === type) {
      await supabase.from("blog_likes").delete().eq("id", existing.id);
    } else {
      await supabase.from("blog_likes").update({ type }).eq("id", existing.id);
    }
  } else {
    await supabase.from("blog_likes").insert({ blog_id: blogId, user_id: user.id, type });
  }

  return { success: true };
}

export async function addBlogComment(blogId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 1000) return { error: "Invalid comment" };

  const { error } = await supabase
    .from("blog_comments")
    .insert({ blog_id: blogId, user_id: user.id, content: trimmed });

  if (error) return { error: error.message };

  revalidatePath(`/blog/${blogId}`);
  return { success: true };
}

export async function deleteBlogComment(commentId: string, blogId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: comment } = await supabase
    .from("blog_comments")
    .select("user_id")
    .eq("id", commentId)
    .maybeSingle();

  if (!comment) return { error: "Not found" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (comment.user_id !== user.id && profile?.role !== "admin") {
    return { error: "Unauthorized" };
  }

  await supabase.from("blog_comments").delete().eq("id", commentId);
  revalidatePath(`/blog/${blogId}`);
  return { success: true };
}
