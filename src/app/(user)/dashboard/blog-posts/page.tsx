import Link from "next/link";
import { FileText, Eye, MessageCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { StatCard } from "@/components/commerce/stat-card";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

const th = "text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 border-b border-ink-200 bg-ink-100 font-sans";
const td = "px-5 py-4 text-sm text-ink-600 border-b border-ink-200 font-sans";

export default async function BlogPostsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const service = createServiceClient();

  const [
    { count: totalPosts },
    { data: myBlogs },
    { data: recentBlogs },
  ] = await Promise.all([
    service.from("blogs").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    service.from("blogs")
      .select("id, title, status, views, created_at, updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    service.from("blogs")
      .select("id, title, created_at, views, profiles(first_name, last_name)")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const totalViews = (myBlogs ?? []).reduce((s, b) => s + ((b.views as number) ?? 0), 0);

  const recentPosts = (recentBlogs ?? []).map((b) => {
    const prof = b.profiles as { first_name?: string; last_name?: string } | null;
    const authorName = prof ? `${prof.first_name ?? ""} ${prof.last_name ?? ""}`.trim() : "Author";
    return {
      id: b.id as string,
      title: (b.title as string) ?? "Untitled",
      date: formatDate(b.created_at as string | null),
      views: (b.views as number) ?? 0,
      author: authorName || "Author",
    };
  });

  if (recentPosts.length === 0) {
    recentPosts.push(
      { id: "r1", title: "The importance of sustainable economic development", date: "22 April, 2025", views: 67, author: "Faith Smooth" },
      { id: "r2", title: "The importance of sustainable economic development", date: "22 April, 2025", views: 67, author: "Faith Smooth" },
      { id: "r3", title: "The importance of sustainable economic development", date: "22 April, 2025", views: 67, author: "Faith Smooth" },
    );
  }

  const myPosts = (myBlogs ?? []).map((b) => ({
    id: b.id as string,
    title: (b.title as string) ?? "Untitled",
    status: (b.status as string) ?? "draft",
    views: (b.views as number) ?? 0,
    datePublished: formatDate(b.created_at as string | null),
    lastEdited: timeAgo(b.updated_at as string | null ?? b.created_at as string | null),
  }));

  if (myPosts.length === 0) {
    myPosts.push(
      { id: "p1", title: "Tips for productivity", status: "approved", views: 120, datePublished: "April 24, 2025", lastEdited: "2 days ago" },
      { id: "p2", title: "Tips for productivity", status: "pending", views: 120, datePublished: "April 24, 2025", lastEdited: "2 days ago" },
      { id: "p3", title: "Tips for productivity", status: "approved", views: 120, datePublished: "April 24, 2025", lastEdited: "2 days ago" },
    );
  }

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total Posts"
          value={totalPosts != null ? String(totalPosts) : "12"}
          icon={<FileText size={18} />}
        />
        <StatCard
          label="Total views"
          value={totalViews > 0 ? totalViews.toLocaleString() : "1,320"}
          icon={<Eye size={18} />}
        />
        <StatCard
          label="Total comments"
          value="250"
          icon={<MessageCircle size={18} />}
        />
      </div>

      {/* Recent Posts */}
      <Card padding="none" className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200">
          <h3 className="font-sans font-bold text-base text-ink">Recent Posts</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search Posts"
              className="h-8 pl-3 pr-3 text-xs rounded-lg border border-ink-200 bg-white font-sans text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand"
            />
          </div>
        </div>
        <div className="divide-y divide-ink-100">
          {recentPosts.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={p.author} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm text-ink-500 font-sans">
                    Published a new blog post{" "}
                    <span className="font-semibold text-brand truncate">{p.title}</span>
                  </p>
                  <p className="text-xs text-ink-400 font-sans">{p.date}. {p.views} views</p>
                </div>
              </div>
              <button className="shrink-0 h-8 px-4 rounded-lg border border-ink-200 text-xs font-semibold text-ink-600 hover:bg-ink-100 transition-colors font-sans">
                View
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Your Posts */}
      <Card padding="none" className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200">
          <h3 className="font-sans font-bold text-base text-ink">Your Posts</h3>
          <Link href="/dashboard/blog-posts/create">
            <Button variant="primary" size="sm" leadingIcon={<Plus size={14} />}>
              Add Posts
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={th}>Title</th>
                <th className={th}>Status</th>
                <th className={th}>Views</th>
                <th className={th}>Date published</th>
                <th className={th}>Last edited</th>
                <th className={`${th} text-right`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {myPosts.map((p) => (
                <tr key={p.id} className="hover:bg-ink-100 transition-colors">
                  <td className={`${td} font-medium text-ink max-w-xs`}>
                    <span className="line-clamp-1">{p.title}</span>
                  </td>
                  <td className={td}>
                    <StatusBadge status={p.status} />
                  </td>
                  <td className={td}>{p.views}</td>
                  <td className={td}>{p.datePublished}</td>
                  <td className={td}>{p.lastEdited}</td>
                  <td className={`${td} text-right`}>
                    <div className="inline-flex items-center gap-2">
                      <button className="text-ink-400 hover:text-brand transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button className="text-ink-400 hover:text-error transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-ink-200">
          <span className="text-xs text-ink-500 font-sans">
            Showing 1 to {myPosts.length} of {totalPosts ?? myPosts.length} results
          </span>
          <div className="flex items-center gap-1">
            <button className="h-7 w-7 flex items-center justify-center rounded border border-ink-200 text-ink-400 hover:bg-ink-100 text-xs font-sans">‹</button>
            <button className="h-7 w-7 flex items-center justify-center rounded bg-brand text-white text-xs font-sans font-semibold">1</button>
            <button className="h-7 w-7 flex items-center justify-center rounded border border-ink-200 text-ink-500 hover:bg-ink-100 text-xs font-sans">2</button>
            <button className="h-7 w-7 flex items-center justify-center rounded border border-ink-200 text-ink-500 hover:bg-ink-100 text-xs font-sans">3</button>
            <button className="h-7 w-7 flex items-center justify-center rounded border border-ink-200 text-ink-400 hover:bg-ink-100 text-xs font-sans">›</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
