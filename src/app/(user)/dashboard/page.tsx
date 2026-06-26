import { Sprout, Users, BookMarked, ClipboardList, Plus } from "lucide-react";
import { StatCard } from "@/components/commerce/stat-card";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

function timeAgo(iso: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) !== 1 ? "s" : ""} ago`;
}

function daysFromNow(iso: string | null) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export default async function UserDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const service = createServiceClient();

  const [
    { count: projectCount },
    { count: memberCount },
    { count: resourceCount },
    { data: upcomingEvents },
    { data: recentBlogs },
  ] = await Promise.all([
    service.from("projects").select("*", { count: "exact", head: true }),
    service.from("profiles").select("*", { count: "exact", head: true }),
    service.from("resources").select("*", { count: "exact", head: true }),
    service.from("events")
      .select("id, name, created_at")
      .gte("created_at", new Date().toISOString())
      .order("created_at", { ascending: true })
      .limit(3),
    service.from("blogs")
      .select("id, title, created_at, category")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const upcomingEventCount = upcomingEvents?.length ?? 0;

  const activities = (recentBlogs ?? []).map((b) => ({
    id: b.id as string,
    type: "Event",
    title: (b.title as string) ?? "New activity",
    time: timeAgo(b.created_at as string | null),
  }));

  const upcoming = (upcomingEvents ?? []).map((e) => ({
    id: e.id as string,
    title: "New Project Created",
    desc: (e.name as string) ?? "Annual gathering of indigenous artisans",
    when: daysFromNow(e.created_at as string | null) ?? "Soon",
  }));

  if (upcoming.length === 0) {
    upcoming.push(
      { id: "u1", title: "New Project Created", desc: "Annual gathering of indigenous artisans", when: "Tomorrow" },
      { id: "u2", title: "New Project Created", desc: "Annual gathering of indigenous artisans", when: "In 3 days" },
      { id: "u3", title: "New Project Created", desc: "Annual gathering of indigenous artisans", when: "In 3 days" },
    );
  }

  if (activities.length === 0) {
    activities.push(
      { id: "a1", type: "Event", title: "Traditional Weaving Workshop in Canada", time: "30 minutes ago" },
      { id: "a2", type: "Event", title: "Traditional Weaving Workshop in Canada", time: "30 minutes ago" },
      { id: "a3", type: "Event", title: "Traditional Weaving Workshop in Canada", time: "30 minutes ago" },
    );
  }

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Projects"
          value={projectCount != null ? String(projectCount) : "230"}
          delta="↑ 15% from last month"
          deltaTone="success"
          iconVariant="green"
          icon={<Sprout size={18} />}
        />
        <StatCard
          label="Community Members"
          value={memberCount != null ? String(memberCount) : "1,320"}
          delta="↑ 3 new this week"
          deltaTone="default"
          iconVariant="purple"
          icon={<Users size={18} />}
        />
        <StatCard
          label="Resources shared"
          value={resourceCount != null ? String(resourceCount) : "124"}
          delta="↑ 5 new this week"
          deltaTone="error"
          iconVariant="red"
          icon={<BookMarked size={18} />}
        />
        <StatCard
          label="Upcoming Events"
          value={upcomingEventCount > 0 ? String(upcomingEventCount) : "24"}
          delta="↑ 30% this month"
          deltaTone="success"
          iconVariant="blue"
          icon={<ClipboardList size={18} />}
        />
      </div>

      {/* Two-column section */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Activities */}
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200">
            <h3 className="font-sans font-bold text-base text-ink">Recent Activities</h3>
            <button className="text-ink-400 hover:text-ink">
              <span className="text-xl leading-none">···</span>
            </button>
          </div>
          <div className="divide-y divide-ink-100">
            {activities.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-4">
                <Logo markOnly height={32} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-ink font-sans">{a.type}</p>
                  <p className="text-sm text-ink-600 font-sans">{a.title}</p>
                  <p className="text-xs text-ink-400 font-sans mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200">
            <h3 className="font-sans font-bold text-base text-ink">Upcoming Events</h3>
            <button className="flex h-7 w-7 items-center justify-center rounded-full border border-ink-200 text-ink-500 hover:bg-ink-100 transition-colors text-sm font-bold">
              <Plus size={14} />
            </button>
          </div>
          <div className="divide-y divide-ink-100">
            {upcoming.map((e, i) => (
              <div
                key={e.id}
                className={`flex items-start justify-between gap-4 px-5 py-4 ${i === 0 ? "bg-[#FFF8E7]" : ""}`}
              >
                <div>
                  <p className="text-sm font-bold text-ink font-sans">{e.title}</p>
                  <p className="text-sm text-ink-500 font-sans mt-0.5">{e.desc}</p>
                </div>
                <span
                  className={`shrink-0 text-xs font-semibold font-sans ${
                    i === 0 ? "text-warning" : "text-ink-400"
                  }`}
                >
                  {e.when}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
