import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ProjectsClient } from "@/components/commerce/projects-client";
import { projects as STATIC } from "@/lib/data";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: rawProjects } = await supabase
    .from("projects")
    .select("id, name, category, summary, target, raised, days_left, status")
    .in("status", ["active", "completed"])
    .order("created_at", { ascending: false });

  type LiveProject = {
    id: string; name: string; category: string; summary: string;
    raised: number; target: number; daysLeft: number; creator: string;
    seed: number; image?: string;
  };

  const liveProjects: LiveProject[] = (rawProjects ?? []).map((p, i) => ({
    id: p.id as string,
    name: p.name as string,
    category: p.category as string,
    summary: (p.summary as string) ?? "",
    raised: Number(p.raised ?? 0),
    target: Number(p.target),
    daysLeft: (p.days_left as number) ?? 30,
    creator: "Community",
    seed: i % 6,
  }));

  const projects = liveProjects.length > 0
    ? liveProjects
    : [...STATIC, { id: "pr4", category: "Medicine", name: "Dibia Documentation Archive", summary: "Recording and digitising over 500 years of Igbo herbal medicine practice.", raised: 800000, target: 3000000, daysLeft: 45, creator: "Heritage Foundation", seed: 2 }];

  return (
    <div>
      <section className="bg-ink-100 border-b border-ink-200">
        <div className="max-w-[var(--container-max)] mx-auto px-6 py-14">
          <Badge tone="brand" className="mb-4">Community Projects</Badge>
          <h1 className="font-display font-bold text-4xl text-ink tracking-tight">Fund the Future</h1>
          <p className="mt-2 text-ink-600 font-sans text-base max-w-lg">
            Back initiatives that turn tradition into livelihoods. Every naira supports real communities.
          </p>
        </div>
      </section>

      <ProjectsClient projects={projects} isLive={liveProjects.length > 0} />

      <section className="py-16 bg-brand">
        <div className="max-w-[var(--container-max)] mx-auto px-6 text-center">
          <h2 className="font-display font-bold text-3xl text-white mb-3">Have a project to fund?</h2>
          <p className="text-white/80 font-sans mb-7 max-w-md mx-auto">
            Verified vendors and community organisations can submit projects for crowdfunding on Symbodied.
          </p>
          <Link href="/signup"><Button variant="gold" size="lg">Start a Project</Button></Link>
        </div>
      </section>
    </div>
  );
}
