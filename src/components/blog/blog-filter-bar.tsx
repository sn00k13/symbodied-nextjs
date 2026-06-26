"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BlogCard } from "@/components/commerce/blog-card";

export type BlogListItem = {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  image: string | undefined;
};

const CATS = ["All", "Agriculture", "Medicine", "Textile", "Technology"];

export function BlogFilterBar({ blogs }: { blogs: BlogListItem[] }) {
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = blogs.filter((b) => {
    const matchCat = active === "All" || b.category.toLowerCase() === active.toLowerCase();
    const matchSearch =
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      {/* Search + category filters — renders inside the hero section */}
      <div className="mt-6 max-w-sm">
        <Input
          placeholder="Search articles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leadingIcon={<Search size={16} />}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
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

      {/* Article grid — full-width section below the hero */}
      <div className="w-screen -mx-6 mt-14 bg-white border-t border-ink-200">
        <div className="max-w-[var(--container-max)] mx-auto px-6 py-14">
          <p className="text-sm text-ink-500 font-sans mb-6">
            <strong className="text-ink">{filtered.length}</strong>{" "}
            {filtered.length === 1 ? "article" : "articles"}
          </p>
          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((b) => (
                <Link key={b.id} href={`/blog/${b.id}`}>
                  <BlogCard {...b} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-ink-500 font-sans">No articles match your search.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
