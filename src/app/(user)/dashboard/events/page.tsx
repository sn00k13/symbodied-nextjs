import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin } from "lucide-react";
import { CancelRsvpButton } from "@/components/dashboard/cancel-rsvp-button";

const th = "text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 border-b border-ink-200 bg-ink-100 font-sans";
const td = "px-5 py-4 text-sm text-ink-600 border-b border-ink-200 font-sans";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

type RsvpRow = {
  id: string;
  created_at: string;
  event_id: string;
  events: {
    id: string;
    name: string;
    theme: string | null;
    date: string | null;
    venue: string | null;
    location: string | null;
    slots: number | null;
    rsvps: number | null;
    status: string;
  } | null;
};

export default async function DashboardEventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const service = createServiceClient();
  const { data: rsvpRows } = await service
    .from("event_rsvps")
    .select("id, created_at, event_id, events(id, name, theme, date, venue, location, slots, rsvps, status)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (rsvpRows ?? []) as unknown as RsvpRow[];

  const now = new Date();
  const upcoming = rows.filter((r) => r.events?.date && new Date(r.events.date) >= now);
  const past = rows.filter((r) => !r.events?.date || new Date(r.events.date) < now);

  return (
    <div className="p-7 flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total RSVPs", value: rows.length },
          { label: "Upcoming", value: upcoming.length },
          { label: "Past", value: past.length },
        ].map((s) => (
          <Card key={s.label} padding="md" className="text-center">
            <div className="font-display font-bold text-3xl text-ink leading-none">{s.value}</div>
            <div className="mt-1 text-xs text-ink-500 font-sans">{s.label}</div>
          </Card>
        ))}
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          {rows.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <CalendarDays size={36} className="mx-auto text-ink-300 mb-3" />
              <p className="text-sm text-ink-400 font-sans">You haven&apos;t RSVPd to any events yet.</p>
              <a href="/events" className="mt-2 inline-block text-sm font-semibold text-brand hover:underline">
                Browse Events →
              </a>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={th}>Event</th>
                  <th className={th}>Date</th>
                  <th className={th}>Location</th>
                  <th className={th}>Slots Left</th>
                  <th className={th}>RSVPd On</th>
                  <th className={`${th} text-right`}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const ev = r.events;
                  const slotsLeft = ev ? Math.max(0, (ev.slots ?? 0) - (ev.rsvps ?? 0)) : null;
                  const isPast = ev?.date ? new Date(ev.date) < now : false;
                  return (
                    <tr key={r.id} className="hover:bg-ink-100 transition-colors">
                      <td className={`${td} font-semibold text-ink max-w-56`}>
                        <div className="line-clamp-1">{ev?.name ?? "—"}</div>
                        {ev?.theme && <Badge tone="neutral" size="sm" className="mt-1">{ev.theme}</Badge>}
                      </td>
                      <td className={td}>
                        <span className={isPast ? "text-ink-400 line-through" : ""}>
                          {formatDate(ev?.date ?? null)}
                        </span>
                        {isPast && <span className="ml-1.5 text-xs text-ink-400">(past)</span>}
                      </td>
                      <td className={td}>
                        {ev?.location ? (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-ink-400 shrink-0" />
                            {ev.venue ? `${ev.venue}, ` : ""}{ev.location}
                          </span>
                        ) : "—"}
                      </td>
                      <td className={td}>{slotsLeft != null ? slotsLeft : "—"}</td>
                      <td className={td}>{formatDate(r.created_at)}</td>
                      <td className={`${td} text-right`}>
                        {!isPast ? (
                          <CancelRsvpButton eventId={r.event_id} />
                        ) : (
                          <span className="text-xs text-ink-400 font-sans">Event ended</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
