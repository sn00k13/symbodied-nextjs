"use client";

import { useState } from "react";
import { EventCard } from "./event-card";
import { EventRsvpButton } from "./event-rsvp-button";

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

interface EventsClientProps {
  events: LiveEvent[];
  userRsvpSet: string[];
  isAuthenticated: boolean;
  isLive: boolean;
}

const MONTHS = ["All", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export function EventsClient({ events, userRsvpSet, isAuthenticated, isLive }: EventsClientProps) {
  const [activeMonth, setActiveMonth] = useState("All");
  const rsvpSet = new Set(userRsvpSet);

  const availableMonths = ["All", ...Array.from(new Set(events.map((e) => e.month)))];
  const filtered = events.filter((e) => activeMonth === "All" || e.month === activeMonth);

  return (
    <section className="py-14 bg-white">
      <div className="max-w-[var(--container-max)] mx-auto px-6">
        <div className="flex flex-wrap gap-2 mb-8">
          {availableMonths.map((m) => (
            <button
              key={m}
              onClick={() => setActiveMonth(m)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold font-sans transition-colors duration-200 border ${
                activeMonth === m
                  ? "bg-brand text-white border-brand"
                  : "bg-white text-ink-600 border-ink-200 hover:border-brand hover:text-brand"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <p className="text-sm text-ink-500 font-sans mb-6">
          <strong className="text-ink">{filtered.length}</strong> upcoming events
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((e) => (
            <EventCard
              key={e.id}
              {...e}
              rsvpButton={
                isLive ? (
                  <EventRsvpButton
                    eventId={e.id}
                    hasRsvpd={rsvpSet.has(e.id)}
                    isAuthenticated={isAuthenticated}
                  />
                ) : undefined
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
