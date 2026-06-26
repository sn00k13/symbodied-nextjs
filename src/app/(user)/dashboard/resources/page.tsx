import { BookOpen, Video, Download, Play, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

type ResourceType = "pdf" | "video";

interface Material {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
}

interface Research {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
}

const FALLBACK_MATERIALS: Material[] = [
  { id: "m1", title: "Indigenous Market Creation Guide", description: "Comprehensive guide for community leaders", type: "pdf" },
  { id: "m2", title: "Indigenous Market Creation Guide", description: "Comprehensive guide for community leaders", type: "video" },
  { id: "m3", title: "Indigenous Market Creation Guide", description: "Comprehensive guide for community leaders", type: "pdf" },
];

const FALLBACK_RESEARCH: Research[] = [
  { id: "r1", title: "Economic Impact Stability", description: "Analysis of indigenous market growth in Latin America", publishedAt: "April 24, 2025" },
  { id: "r2", title: "Economic Impact Stability", description: "Analysis of indigenous market growth in Latin America", publishedAt: "April 24, 2025" },
  { id: "r3", title: "Economic Impact Stability", description: "Analysis of indigenous market growth in Latin America", publishedAt: "April 24, 2025" },
];

function MaterialIcon({ type }: { type: ResourceType }) {
  if (type === "video") {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EDE9FE] text-[#7C3AED]">
        <Video size={18} />
      </span>
    );
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
      <BookOpen size={18} />
    </span>
  );
}

function ActionButton({ type }: { type: ResourceType }) {
  if (type === "video") {
    return (
      <button className="shrink-0 inline-flex items-center gap-1.5 h-8 px-4 rounded-lg bg-[#EDE9FE] text-[#7C3AED] text-xs font-semibold font-sans hover:opacity-90 transition-opacity">
        <Play size={13} />
        Watch Now
      </button>
    );
  }
  return (
    <button className="shrink-0 inline-flex items-center gap-1.5 h-8 px-4 rounded-lg bg-brand text-white text-xs font-semibold font-sans hover:bg-brand-hover transition-colors">
      <Download size={13} />
      Download PDF
    </button>
  );
}

export default async function ResourcesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const service = createServiceClient();

  let materials: Material[] = FALLBACK_MATERIALS;
  let research: Research[] = FALLBACK_RESEARCH;

  try {
    const { data: rawResources } = await service
      .from("resources")
      .select("id, title, description, type, published_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (rawResources && rawResources.length > 0) {
      materials = rawResources
        .filter((r) => r.type === "pdf" || r.type === "video")
        .map((r) => ({
          id: r.id as string,
          title: (r.title as string) ?? "Resource",
          description: (r.description as string) ?? "",
          type: (r.type as ResourceType),
        }));

      research = rawResources
        .filter((r) => r.type === "article")
        .map((r) => ({
          id: r.id as string,
          title: (r.title as string) ?? "Research",
          description: (r.description as string) ?? "",
          publishedAt: r.published_at
            ? new Date(r.published_at as string).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
            : "—",
        }));

      if (materials.length === 0) materials = FALLBACK_MATERIALS;
      if (research.length === 0) research = FALLBACK_RESEARCH;
    }
  } catch {
    // table may not exist yet; fall through to static data
  }

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Search + Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-lg">
          <input
            type="text"
            placeholder="Search Members"
            className="w-full h-10 pl-4 pr-4 rounded-lg border border-ink-200 bg-white font-sans text-sm text-ink placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <button className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-ink-200 bg-white text-sm font-semibold text-ink font-sans hover:bg-ink-100 transition-colors">
          <Filter size={15} />
          Filter
        </button>
      </div>

      {/* Two-column section */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Educational Materials */}
        <Card padding="none" className="overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-200">
            <h3 className="font-sans font-bold text-base text-ink">Educational Materials</h3>
          </div>
          <div className="divide-y divide-ink-100">
            {materials.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <MaterialIcon type={m.type} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink font-sans truncate">{m.title}</p>
                    <p className="text-xs text-ink-500 font-sans">{m.description}</p>
                  </div>
                </div>
                <ActionButton type={m.type} />
              </div>
            ))}
          </div>
        </Card>

        {/* Latest Research */}
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200">
            <h3 className="font-sans font-bold text-base text-ink">Latest Research</h3>
            <button className="text-ink-400 hover:text-ink">
              <span className="text-xl leading-none">···</span>
            </button>
          </div>
          <div className="divide-y divide-ink-100">
            {research.map((r) => (
              <div key={r.id} className="px-5 py-4">
                <p className="text-sm font-semibold text-ink font-sans">{r.title}</p>
                <p className="text-xs text-ink-500 font-sans mt-0.5">{r.description}</p>
                <p className="text-xs text-ink-400 font-sans mt-1">Published: {r.publishedAt}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
