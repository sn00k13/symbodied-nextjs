import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { BlogCard } from "@/components/commerce/blog-card";
import { BlogReactions } from "@/components/blog/blog-reactions";
import { BlogComments, type CommentRow } from "@/components/blog/blog-comments";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

const STATIC_BLOGS = [
  { id: "b1", category: "Medicine", title: "The Dibia Pharmacopoeia: Documenting Igbo Herbal Knowledge", excerpt: "How communities are preserving centuries of botanical medicine for the next generation of healers.", author: "Dr. Ada Eze", date: "Jun 12, 2026", readTime: "6 min read", image: "/images/blogs/img_683c8bdbbd0ec.webp" },
  { id: "b2", category: "Agriculture", title: "Reviving Yam Barns: Storage Traditions That Still Work", excerpt: "Pre-colonial storage techniques are outperforming modern silos in humid climates.", author: "Chidi Nwosu", date: "Jun 8, 2026", readTime: "4 min read", image: "/images/blogs/img_683c97d33a54b.webp" },
  { id: "b3", category: "Textile", title: "From Loom to Runway: The Akwete Resurgence", excerpt: "A new generation of weavers is taking heritage cloth global without losing its soul.", author: "Ngozi Okafor", date: "Jun 2, 2026", readTime: "5 min read", image: "/images/blogs/img_683c9cfac47b4.webp" },
];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // ── Live blog from Supabase ──────────────────────────────────────────────
  if (UUID_RE.test(slug)) {
    const [
      { data: rawBlog },
      { data: { user } },
    ] = await Promise.all([
      supabase
        .from("blogs")
        .select("id, title, category, content, excerpt, image_url, created_at, views, profiles(first_name, last_name)")
        .eq("id", slug)
        .in("status", ["approved", "published"])
        .maybeSingle(),
      supabase.auth.getUser(),
    ]);

    if (!rawBlog) notFound();

    type RawBlog = typeof rawBlog & {
      profiles:
        | { first_name: string | null; last_name: string | null }
        | { first_name: string | null; last_name: string | null }[]
        | null;
    };
    const raw = rawBlog as unknown as RawBlog;
    const p = Array.isArray(raw.profiles) ? raw.profiles[0] : raw.profiles;
    const author = p
      ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Community Member"
      : "Community Member";

    const [
      { data: likesData },
      { data: rawComments },
      { data: profile },
    ] = await Promise.all([
      supabase.from("blog_likes").select("type, user_id").eq("blog_id", slug),
      supabase
        .from("blog_comments")
        .select("id, content, created_at, user_id, profiles(first_name, last_name)")
        .eq("blog_id", slug)
        .order("created_at", { ascending: true }),
      user
        ? supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const likes = (likesData ?? []).filter((l) => l.type === "like").length;
    const dislikes = (likesData ?? []).filter((l) => l.type === "dislike").length;
    const userVote = user
      ? ((likesData ?? []).find((l) => l.user_id === user.id)?.type as "like" | "dislike" | undefined) ?? null
      : null;

    type RawComment = {
      id: string;
      content: string;
      created_at: string;
      user_id: string;
      profiles:
        | { first_name: string | null; last_name: string | null }
        | { first_name: string | null; last_name: string | null }[]
        | null;
    };
    const comments: CommentRow[] = (rawComments ?? []).map((c) => {
      const rc = c as unknown as RawComment;
      const cp = Array.isArray(rc.profiles) ? rc.profiles[0] : rc.profiles;
      return { id: rc.id, content: rc.content, created_at: rc.created_at, user_id: rc.user_id, profiles: cp ?? null };
    });

    const isAdmin = (profile as { role?: string } | null)?.role === "admin";

    return (
      <div className="bg-white">
        <div className="max-w-[var(--container-max)] mx-auto px-6">
          <div className="pt-8">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand font-sans transition-colors">
              <ArrowLeft size={15} /> Back to Blog
            </Link>
          </div>

          {raw.image_url && (
            <div className="mt-6 max-w-2xl">
              <div className="relative h-[340px] rounded-2xl overflow-hidden">
                <Image
                  src={raw.image_url as string}
                  alt={raw.title as string}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 42rem"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
              </div>
            </div>
          )}

          <article className="max-w-2xl py-12">
            <Badge tone="brand" className="mb-5">{raw.category as string}</Badge>
            <h1 className="font-display font-bold text-4xl text-ink leading-tight tracking-tight mb-6">
              {raw.title as string}
            </h1>

            <div className="flex items-center gap-4 pb-7 border-b border-ink-200 mb-8">
              <Avatar name={author} size="md" />
              <div className="flex-1">
                <div className="font-semibold text-sm text-ink font-sans">{author}</div>
                <div className="text-xs text-ink-500 font-sans">{formatDate(raw.created_at as string | null)}</div>
              </div>
              <div className="flex items-center gap-3 text-xs text-ink-500 font-sans">
                <span className="flex items-center gap-1">
                  <Eye size={12} />{(raw.views as number | null) ?? 0} views
                </span>
              </div>
            </div>

            <div className="space-y-5 font-sans text-ink-600 leading-[1.8]">
              {raw.excerpt && (
                <p className="text-xl text-ink-700 font-medium leading-relaxed">{raw.excerpt as string}</p>
              )}
              {raw.content ? (
                <div className="whitespace-pre-wrap">{raw.content as string}</div>
              ) : (
                <p className="text-ink-400 italic">Content coming soon.</p>
              )}
            </div>

            <div className="mt-10 pt-6 border-t border-ink-200">
              <p className="text-xs text-ink-400 font-sans mb-3">Was this article helpful?</p>
              <BlogReactions
                blogId={slug}
                likes={likes}
                dislikes={dislikes}
                userVote={userVote}
                isAuthenticated={!!user}
              />
            </div>

            <BlogComments
              blogId={slug}
              initialComments={comments}
              currentUserId={user?.id ?? null}
              isAdmin={isAdmin}
            />
          </article>
        </div>
      </div>
    );
  }

  // ── Static fallback (for legacy /blog/b1 etc.) ───────────────────────────
  const post = STATIC_BLOGS.find((b) => b.id === slug);
  if (!post) notFound();

  const related = STATIC_BLOGS.filter((b) => b.id !== slug);

  return (
    <div className="bg-white">
      <div className="max-w-[var(--container-max)] mx-auto px-6">
        <div className="pt-8">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand font-sans transition-colors">
            <ArrowLeft size={15} /> Back to Blog
          </Link>
        </div>

        {post.image && (
          <div className="mt-6 max-w-2xl">
            <div className="relative h-[340px] rounded-2xl overflow-hidden">
              <Image src={post.image} alt={post.title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 42rem" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
            </div>
          </div>
        )}

        <article className="max-w-2xl py-12">
          <Badge tone="brand" className="mb-5">{post.category}</Badge>
          <h1 className="font-display font-bold text-4xl text-ink leading-tight tracking-tight mb-6">{post.title}</h1>

          <div className="flex items-center gap-4 pb-7 border-b border-ink-200 mb-8">
            <Avatar name={post.author} size="md" />
            <div className="flex-1">
              <div className="font-semibold text-sm text-ink font-sans">{post.author}</div>
              <div className="text-xs text-ink-500 font-sans">{post.date}</div>
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-500 font-sans">
              <span className="flex items-center gap-1"><Clock size={12} />{post.readTime}</span>
              <span className="flex items-center gap-1"><Eye size={12} />1.2k views</span>
            </div>
          </div>

          <div className="space-y-5 font-sans text-ink-600 leading-[1.8]">
            <p className="text-xl text-ink-700 font-medium leading-relaxed">{post.excerpt}</p>
            <p>Across communities from Nsukka to Ibadan, practitioners and researchers are working together to preserve knowledge that might otherwise be lost. What began as informal documentation projects has evolved into a broader movement to respect, record, and transmit traditional wisdom.</p>
            <p>The challenge is not simply archival. It requires building trust with elders and specialists who have, understandably, been wary of extraction — of outsiders taking knowledge without giving back. Symbodied&apos;s approach centres reciprocity: communities own and control their documented knowledge, and any commercial benefit flows back to the source.</p>
            <h2 className="font-display font-bold text-2xl text-ink mt-8 mb-3">What This Means in Practice</h2>
            <p>Vendors on the platform are required to trace provenance — where a product was made, by whom, using which methods. This traceability creates accountability and premium value. Buyers know exactly what they are supporting.</p>
            <h2 className="font-display font-bold text-2xl text-ink mt-8 mb-3">Looking Forward</h2>
            <p>The work is ongoing. Symbodied is partnering with universities and cultural foundations to digitise records, translate documentation, and build open repositories that communities can access freely.</p>
          </div>
        </article>
      </div>

      {related.length > 0 && (
        <section className="py-14 bg-ink-100">
          <div className="max-w-[var(--container-max)] mx-auto px-6">
            <h2 className="font-sans font-bold text-xl text-ink mb-7">More Articles</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((b) => (
                <Link key={b.id} href={`/blog/${b.id}`}>
                  <BlogCard {...b} excerpt={b.excerpt} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
