"use client";

import { useState } from "react";
import { ProjectCard } from "./project-card";
import { DonateModal } from "./donate-modal";

type Project = {
  id: string; name: string; category: string; summary: string;
  raised: number; target: number; daysLeft: number; creator: string;
  seed?: number; image?: string;
};

interface ProjectsClientProps {
  projects: Project[];
  isAuthenticated: boolean;
  isLive: boolean;
}

const CATS = ["All", "Agriculture", "Medicine", "Technology", "Textile"];

export function ProjectsClient({ projects, isAuthenticated, isLive }: ProjectsClientProps) {
  const [active, setActive] = useState("All");
  const [donating, setDonating] = useState<Project | null>(null);

  const filtered = projects.filter((p) => active === "All" || p.category === active);

  return (
    <>
      <section className="py-14 bg-white">
        <div className="max-w-[var(--container-max)] mx-auto px-6">
          <div className="flex flex-wrap gap-2 mb-8">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold font-sans transition-colors duration-200 border ${
                  active === c
                    ? "bg-brand text-white border-brand"
                    : "bg-white text-ink-600 border-ink-200 hover:border-brand hover:text-brand"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="text-sm text-ink-500 font-sans mb-6">
            <strong className="text-ink">{filtered.length}</strong> active projects
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <ProjectCard
                key={p.id}
                {...p}
                onDonate={isLive ? () => setDonating(p) : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      {donating && (
        <DonateModal
          projectId={donating.id}
          projectName={donating.name}
          isAuthenticated={isAuthenticated}
          onClose={() => setDonating(null)}
        />
      )}
    </>
  );
}
