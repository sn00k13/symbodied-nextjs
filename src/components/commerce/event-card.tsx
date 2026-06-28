import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users } from "lucide-react";

interface EventCardProps {
  day: string;
  month: string;
  theme: string;
  name: string;
  venue: string;
  location: string;
  slotsLeft: number;
  onRSVP?: () => void;
  rsvpButton?: React.ReactNode;
}

export function EventCard({ day, month, theme, name, venue, location, slotsLeft, onRSVP, rsvpButton }: EventCardProps) {
  return (
    <div className="bg-white dark:bg-[#162018] rounded-xl border border-ink-200 dark:border-[#263a2b] shadow-[var(--shadow-sm)] p-5 flex gap-4 transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5">
      <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-brand-light dark:bg-[#112618] text-brand dark:text-[#2E9B5A]">
        <span className="font-display font-bold text-2xl leading-none">{day}</span>
        <span className="text-xs font-semibold uppercase tracking-wide">{month}</span>
      </div>
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <Badge tone="neutral" size="sm" className="self-start">{theme}</Badge>
        <h3 className="font-sans font-bold text-sm text-ink dark:text-[#dceee3] leading-snug line-clamp-1">{name}</h3>
        <div className="flex items-center gap-3 text-xs text-ink-500 dark:text-[#668074] font-sans">
          <span className="flex items-center gap-1"><MapPin size={11} />{venue}, {location}</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="flex items-center gap-1 text-xs text-ink-500 dark:text-[#668074] font-sans">
            <Users size={11} />{slotsLeft} slots left
          </span>
          {rsvpButton ?? <Button variant="primary" size="sm" onClick={onRSVP}>RSVP</Button>}
        </div>
      </div>
    </div>
  );
}
