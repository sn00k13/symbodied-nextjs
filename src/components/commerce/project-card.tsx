import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PhotoPlaceholder } from "./photo-placeholder";
import { naira, pct } from "@/lib/utils";
import { Clock } from "lucide-react";

interface ProjectCardProps {
  name: string;
  category: string;
  summary: string;
  raised: number;
  target: number;
  creator: string;
  daysLeft: number;
  seed?: number;
  image?: string;
  onDonate?: () => void;
  dark?: boolean;
}

export function ProjectCard({ name, category, summary, raised, target, creator, daysLeft, seed = 0, image, onDonate, dark }: ProjectCardProps) {
  const funded = pct(raised, target);
  const cardClass = dark
    ? "bg-ink-800 border-ink-700 text-white"
    : "bg-white border-ink-200 text-ink";
  return (
    <div className={`rounded-xl border shadow-[var(--shadow-sm)] overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 ${cardClass}`}>
      <div className="relative aspect-[16/9] overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <PhotoPlaceholder seed={seed} label={category} />
        )}
      </div>
      <div className="p-5 flex flex-col gap-3">
        <Badge tone="brand" size="sm" className="self-start">{category}</Badge>
        <h3 className={`font-sans font-bold text-base leading-snug line-clamp-1 ${dark ? "text-white" : "text-ink"}`}>{name}</h3>
        <p className={`text-sm leading-relaxed line-clamp-2 ${dark ? "text-white/70" : "text-ink-600"}`}>{summary}</p>
        <div className="flex flex-col gap-1.5">
          <div className={`flex justify-between text-xs font-sans ${dark ? "text-white/60" : "text-ink-500"}`}>
            <span className={`font-semibold ${dark ? "text-white" : "text-ink"}`}>{naira(raised)} raised</span>
            <span>{funded}%</span>
          </div>
          <ProgressBar value={funded} color="gold" size="sm" />
          <div className={`flex justify-between text-xs font-sans ${dark ? "text-white/60" : "text-ink-500"}`}>
            <span>of {naira(target)}</span>
            <span className="flex items-center gap-1"><Clock size={10} />{daysLeft}d left</span>
          </div>
        </div>
        <p className={`text-xs font-sans ${dark ? "text-white/50" : "text-ink-500"}`}>by {creator}</p>
        <Button variant="gold" size="sm" fullWidth onClick={onDonate}>Donate Now</Button>
      </div>
    </div>
  );
}
