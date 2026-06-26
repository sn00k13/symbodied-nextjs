"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createEvent } from "@/app/actions/events";

const THEMES = ["Agriculture", "Medicine", "Technology", "Textile", "Cultural Programming", "Marketplace", "Community"];

const field = "w-full h-11 px-4 rounded-lg border border-ink-200 font-sans text-sm text-ink bg-white placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";
const label = "text-sm font-semibold text-ink font-sans";

export default function AdminCreateEventPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createEvent(formData);
      if (result?.error) setError(result.error);
      else router.push("/admin");
    });
  };

  return (
    <div className="p-7 max-w-2xl">
      <h2 className="font-sans font-bold text-xl text-ink mb-6">Create Event</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-ink-200 p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className={label}>Event Name</label>
          <input name="name" required placeholder="e.g. Igbo Heritage Summit 2026" className={field} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={label}>Theme</label>
            <div className="relative">
              <select name="theme" defaultValue="" className={`${field} appearance-none pr-9`}>
                <option value="">Select theme</option>
                {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">▾</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={label}>Date</label>
            <input name="date" type="date" required className={field} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={label}>Venue</label>
            <input name="venue" placeholder="e.g. Eko Convention Centre" className={field} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={label}>Location</label>
            <input name="location" placeholder="e.g. Lagos" className={field} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={label}>Available Slots</label>
          <input name="slots" type="number" min="1" defaultValue="100" required className={field} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={label}>Description <span className="font-normal text-ink-400">(optional)</span></label>
          <textarea name="description" rows={3} placeholder="Describe the event…"
            className="w-full px-4 py-3 rounded-lg border border-ink-200 font-sans text-sm text-ink bg-white placeholder:text-ink-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none" />
        </div>
        {error && <p className="text-sm text-error font-sans">{error}</p>}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" variant="primary" loading={pending} leadingIcon={<Send size={14} />}>Publish Event</Button>
        </div>
      </form>
    </div>
  );
}
