import { Users, UserPlus, MessageSquare, Building2, Search } from "lucide-react";
import { StatCard } from "@/components/commerce/stat-card";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

function timeAgo(iso: string | null) {
  if (!iso) return "recently";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) !== 1 ? "s" : ""} ago`;
}

const COMMUNITY_UPDATES = [
  {
    id: "cu1",
    type: "Announcement",
    typeColor: "text-warning",
    typeIcon: "📣",
    desc: "Annual gathering of indigenous artisans",
    time: "30 minutes ago",
  },
  {
    id: "cu2",
    type: "Achievement",
    typeColor: "text-brand",
    typeIcon: "🏆",
    desc: "Canada artisan collective reached 1000 members",
    time: "30 minutes ago",
  },
  {
    id: "cu3",
    type: "New Group",
    typeColor: "text-[#7C3AED]",
    typeIcon: "👥",
    desc: "Traditional Medicine Practitioners group created",
    time: "30 minutes ago",
  },
];

export default async function CommunitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const service = createServiceClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: totalMembers },
    { count: newThisMonth },
    { data: recentMembers },
  ] = await Promise.all([
    service.from("profiles").select("*", { count: "exact", head: true }),
    service.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth),
    service.from("profiles")
      .select("id, first_name, last_name, role, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const members = (recentMembers ?? []).map((p) => ({
    id: p.id as string,
    name: `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Community Member",
    role: (p.role as string) === "vendor" ? "Artisan Vendor" : "Community Member",
    location: "Symbodied",
    time: timeAgo(p.created_at as string | null),
  }));

  if (members.length === 0) {
    members.push(
      { id: "m1", name: "Faith Smooth", role: "Traditional Weaver", location: "Canada", time: "30 minutes ago" },
      { id: "m2", name: "Faith Smooth", role: "Traditional Weaver", location: "Canada", time: "30 minutes ago" },
      { id: "m3", name: "Faith Smooth", role: "Traditional Weaver", location: "Canada", time: "30 minutes ago" },
    );
  }

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Members"
          value={totalMembers != null ? totalMembers.toLocaleString() : "1,320"}
          icon={<Users size={18} />}
        />
        <StatCard
          label="New This Month"
          value={newThisMonth != null ? String(newThisMonth) : "250"}
          icon={<UserPlus size={18} />}
        />
        <StatCard
          label="Active Discussions"
          value="524"
          icon={<MessageSquare size={18} />}
        />
        <StatCard
          label="Partner Organizations"
          value="24"
          icon={<Building2 size={18} />}
        />
      </div>

      {/* Two-column section */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Active Members */}
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200">
            <h3 className="font-sans font-bold text-base text-ink">Active Members</h3>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                placeholder="Search Members"
                className="h-8 pl-8 pr-3 text-xs rounded-lg border border-ink-200 bg-white font-sans text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand"
              />
            </div>
          </div>
          <div className="divide-y divide-ink-100">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-ink font-sans">{m.name}</p>
                    <p className="text-xs text-ink-500 font-sans">{m.role}, {m.location}</p>
                  </div>
                </div>
                <button className="h-8 px-4 rounded-lg border border-ink-200 text-xs font-semibold text-ink-600 hover:bg-ink-100 transition-colors font-sans">
                  Message
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Community Updates */}
        <Card padding="none" className="overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-200">
            <h3 className="font-sans font-bold text-base text-ink">Community Updates</h3>
          </div>
          <div className="divide-y divide-ink-100">
            {COMMUNITY_UPDATES.map((u) => (
              <div key={u.id} className="px-5 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{u.typeIcon}</span>
                  <span className={`text-sm font-bold font-sans ${u.typeColor}`}>{u.type}</span>
                </div>
                <p className="text-sm text-ink font-sans">{u.desc}</p>
                <p className="text-xs text-ink-400 font-sans mt-1">{u.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
