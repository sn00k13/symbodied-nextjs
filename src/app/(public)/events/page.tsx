import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { EventsClient } from "@/components/commerce/events-client";

type LiveEvent = {
  id: string;
  day: string;
  month: string;
  theme: string;
  name: string;
  venue: string;
  location: string;
  slotsLeft: number;
};

const STATIC_EVENTS: LiveEvent[] = [
  { id: "e1", day: "24", month: "AUG", theme: "Cultural Programming", name: "Igbo Heritage & Agritech Summit", venue: "Eko Convention Centre", location: "Lagos", slotsLeft: 42 },
  { id: "e2", day: "07", month: "SEP", theme: "Marketplace", name: "Diaspora Vendor Expo 2026", venue: "Landmark Centre", location: "Lagos", slotsLeft: 15 },
  { id: "e3", day: "19", month: "SEP", theme: "Medicine", name: "Traditional Medicine Symposium", venue: "UNN Conference Hall", location: "Nsukka", slotsLeft: 88 },
  { id: "e4", day: "02", month: "OCT", theme: "Agriculture", name: "Smallholder Farmers Forum", venue: "Enugu State Exhibition Centre", location: "Enugu", slotsLeft: 120 },
  { id: "e5", day: "15", month: "OCT", theme: "Textile", name: "West African Craft & Textile Fair", venue: "National Theatre", location: "Lagos", slotsLeft: 60 },
  { id: "e6", day: "08", month: "NOV", theme: "Technology", name: "Agritech Innovation Challenge", venue: "CcHUB", location: "Lagos", slotsLeft: 30 },
];

export default async function EventsPage() {
  const supabase = await createClient();

  const [
    { data: rawEvents },
    { data: { user } },
  ] = await Promise.all([
    supabase
      .from("events")
      .select("id, name, theme, date, venue, location, slots, rsvps, status")
      .eq("status", "active")
      .order("date", { ascending: true }),
    supabase.auth.getUser(),
  ]);

  let userRsvpSet = new Set<string>();
  if (user && rawEvents && rawEvents.length > 0) {
    const { data: rsvps } = await supabase
      .from("event_rsvps")
      .select("event_id")
      .eq("user_id", user.id)
      .in("event_id", rawEvents.map((e) => e.id as string));
    userRsvpSet = new Set((rsvps ?? []).map((r) => r.event_id as string));
  }

  const liveEvents: LiveEvent[] = (rawEvents ?? []).map((e) => {
    const d = new Date(e.date as string);
    return {
      id: e.id as string,
      day: String(d.getDate()).padStart(2, "0"),
      month: d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
      theme: (e.theme as string) ?? "Community",
      name: e.name as string,
      venue: (e.venue as string) ?? "",
      location: (e.location as string) ?? "",
      slotsLeft: Math.max(0, (e.slots as number) - (e.rsvps as number)),
    };
  });

  const events = liveEvents.length > 0 ? liveEvents : STATIC_EVENTS;
  const rsvpSet = liveEvents.length > 0 ? userRsvpSet : new Set<string>();

  return (
    <div>
      <section className="bg-ink-100 border-b border-ink-200">
        <div className="max-w-[var(--container-max)] mx-auto px-6 py-14">
          <Badge tone="brand" className="mb-4">Events Calendar</Badge>
          <h1 className="font-display font-bold text-4xl text-ink tracking-tight">What&apos;s On</h1>
          <p className="mt-2 text-ink-600 font-sans text-base max-w-lg">
            Summits, expos, workshops, and community gatherings across the continent and diaspora.
          </p>
        </div>
      </section>
      <EventsClient
        events={events}
        userRsvpSet={Array.from(rsvpSet)}
        isAuthenticated={!!user}
        isLive={liveEvents.length > 0}
      />
    </div>
  );
}
