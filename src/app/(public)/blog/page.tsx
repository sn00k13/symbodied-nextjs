import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { BlogFilterBar, type BlogListItem } from "@/components/blog/blog-filter-bar";
import { formatDate } from "@/lib/utils";

export default async function BlogPage() {
  const supabase = await createClient();

  const { data: rawBlogs } = await supabase
    .from("blogs")
    .select("id, title, category, excerpt, image_url, created_at, profiles(first_name, last_name)")
    .in("status", ["approved", "published"])
    .order("created_at", { ascending: false });

  type RawBlog = {
    id: string;
    title: string;
    category: string;
    excerpt: string | null;
    image_url: string | null;
    created_at: string | null;
    profiles:
      | { first_name: string | null; last_name: string | null }
      | { first_name: string | null; last_name: string | null }[]
      | null;
  };

  const blogs: BlogListItem[] = (rawBlogs ?? []).map((b) => {
    const raw = b as unknown as RawBlog;
    const p = Array.isArray(raw.profiles) ? raw.profiles[0] : raw.profiles;
    const author = p
      ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Community Member"
      : "Community Member";
    return {
      id: raw.id,
      title: raw.title,
      category: raw.category ?? "General",
      excerpt: raw.excerpt ?? "",
      author,
      date: formatDate(raw.created_at),
      readTime: "5 min read",
      image: raw.image_url ?? undefined,
    };
  });

  return (
    <div className="overflow-x-hidden">
      <section className="bg-brand-light border-b border-ink-200">
        <div className="max-w-[var(--container-max)] mx-auto px-6 py-14">
          <Badge tone="brand" className="mb-4">Articles &amp; Insights</Badge>
          <h1 className="font-display font-bold text-4xl text-ink tracking-tight">
            From the Community
          </h1>
          <p className="mt-2 text-ink-600 font-sans text-base max-w-lg">
            Perspectives, research, and stories from vendors, practitioners, and community members.
          </p>
          <BlogFilterBar blogs={blogs} />
        </div>
      </section>
    </div>
  );
}
