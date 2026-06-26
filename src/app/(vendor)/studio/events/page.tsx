import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const th = "text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 border-b border-ink-200 bg-ink-100 font-sans";
const td = "px-5 py-4 text-sm text-ink-600 border-b border-ink-200 font-sans";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function StudioEventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const service = createServiceClient();
  const { data: events } = await service
    .from("events")
    .select("id, name, theme, date, venue, slots, rsvps, status")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  return (
    <div className="p-7 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-sans font-bold text-xl text-ink">My Events</h2>
        <Link href="/studio/events/create">
          <Button variant="primary" size="sm" leadingIcon={<Plus size={15} />}>Create Event</Button>
        </Link>
      </div>
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          {!events || events.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink-400 font-sans text-center">No events yet. Create your first event.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={th}>Event</th>
                  <th className={th}>Theme</th>
                  <th className={th}>Date</th>
                  <th className={th}>Venue</th>
                  <th className={th}>RSVPs</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id as string} className="hover:bg-ink-100 transition-colors">
                    <td className={`${td} font-semibold text-ink`}>{e.name as string}</td>
                    <td className={td}><Badge tone="neutral" size="sm">{(e.theme as string) ?? "—"}</Badge></td>
                    <td className={td}>{formatDate(e.date as string | null)}</td>
                    <td className={td}>{(e.venue as string) ?? "—"}</td>
                    <td className={td}>
                      {e.rsvps != null && e.slots != null
                        ? `${e.rsvps}/${e.slots}`
                        : (e.rsvps as number) ?? "—"}
                    </td>
                    <td className={td}><StatusBadge status={e.status as string} /></td>
                    <td className={`${td} text-right`}>
                      <Button variant="ghost" size="sm">Manage</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
