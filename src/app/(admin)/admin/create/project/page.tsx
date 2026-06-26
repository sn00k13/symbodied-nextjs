"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createProject } from "@/app/actions/donations";

const CATEGORIES = ["Agriculture", "Medicine", "Technology", "Textile"];

const field = "w-full h-11 px-4 rounded-lg border border-ink-200 font-sans text-sm text-ink bg-white placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";
const label = "text-sm font-semibold text-ink font-sans";

export default function AdminCreateProjectPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createProject(formData);
      if (result?.error) setError(result.error);
      else router.push("/admin");
    });
  };

  return (
    <div className="p-7 max-w-2xl">
      <h2 className="font-sans font-bold text-xl text-ink mb-6">Create Project</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-ink-200 p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className={label}>Project Name</label>
          <input name="name" required placeholder="e.g. Cassava Processing Hub — Enugu" className={field} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={label}>Category</label>
            <div className="relative">
              <select name="category" defaultValue="" required className={`${field} appearance-none pr-9`}>
                <option value="" disabled>Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">▾</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={label}>Funding Target (₦)</label>
            <input name="target" type="number" min="1" step="0.01" required placeholder="0.00" className={field} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={label}>Days to Run</label>
          <input name="days_left" type="number" min="1" defaultValue="30" required className={field} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={label}>Summary <span className="font-normal text-ink-400">(shown on card)</span></label>
          <textarea name="summary" rows={2} placeholder="One or two sentences describing the project…"
            className="w-full px-4 py-3 rounded-lg border border-ink-200 font-sans text-sm text-ink bg-white placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={label}>Full Description <span className="font-normal text-ink-400">(optional)</span></label>
          <textarea name="description" rows={4} placeholder="Detailed project description…"
            className="w-full px-4 py-3 rounded-lg border border-ink-200 font-sans text-sm text-ink bg-white placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none" />
        </div>
        {error && <p className="text-sm text-error font-sans">{error}</p>}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" variant="primary" loading={pending} leadingIcon={<Send size={14} />}>Create Project</Button>
        </div>
      </form>
    </div>
  );
}
