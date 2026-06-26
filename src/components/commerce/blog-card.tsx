import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { PhotoPlaceholder } from "./photo-placeholder";
import { Clock } from "lucide-react";

interface BlogCardProps {
  title: string;
  category: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  seed?: number;
  image?: string;
  className?: string;
}

export function BlogCard({ title, category, excerpt, author, date, readTime, seed = 0, image, className }: BlogCardProps) {
  return (
    <article className={`group bg-white rounded-xl border border-ink-200 shadow-[var(--shadow-sm)] overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 cursor-pointer ${className ?? ""}`}>
      <div className="relative aspect-[16/9] overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <PhotoPlaceholder seed={seed} label={category} />
        )}
      </div>
      <div className="p-5 flex flex-col gap-3">
        <Badge tone="brand" size="sm" className="self-start">{category}</Badge>
        <h3 className="font-sans font-bold text-base text-ink leading-snug line-clamp-1 group-hover:text-brand transition-colors duration-200">
          {title}
        </h3>
        <p className="text-sm text-ink-600 font-sans leading-relaxed line-clamp-3">{excerpt}</p>
        <div className="flex items-center justify-between pt-1 border-t border-ink-200">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-ink font-sans">{author}</span>
            <span className="text-xs text-ink-500 font-sans">{date}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-ink-500 font-sans">
            <Clock size={11} />
            {readTime}
          </div>
        </div>
      </div>
    </article>
  );
}
