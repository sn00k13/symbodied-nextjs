"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Programs", href: "/programs" },
  { label: "Blog", href: "/blog" },
  { label: "Projects", href: "/projects" },
  { label: "Events", href: "/events" },
];

export function Navbar() {
  const pathname = usePathname();
  const count = useCart((s) => s.count());
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-[#0f1611] border-b border-ink-200 dark:border-[#263a2b] shadow-[var(--shadow-xs)]" style={{ height: "var(--header-height)" }}>
        <div className="max-w-[var(--container-max)] mx-auto h-full px-6 flex items-center gap-6">
          <Link href="/" className="flex-shrink-0">
            <Logo height={30} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4 flex-1">
            {NAV.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold font-sans transition-colors duration-200",
                    active ? "text-brand bg-brand-light dark:bg-[#112618]" : "text-ink-600 dark:text-[#89a895] hover:text-ink dark:hover:text-[#dceee3] hover:bg-ink-100 dark:hover:bg-[#1b2d20]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            <button aria-label="Search" className="h-10 w-10 flex items-center justify-center rounded-lg text-ink-600 dark:text-[#89a895] hover:bg-ink-100 dark:hover:bg-[#1b2d20] transition-colors duration-200">
              <Search size={20} />
            </button>
            <ThemeToggle />
            <Link href="/cart" aria-label="Cart" className="relative h-10 w-10 flex items-center justify-center rounded-lg text-ink-600 dark:text-[#89a895] hover:bg-ink-100 dark:hover:bg-[#1b2d20] transition-colors duration-200">
              <ShoppingCart size={20} />
              {mounted && count > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-ink text-[11px] font-bold flex items-center justify-center font-sans">
                  {count}
                </span>
              )}
            </Link>
            {mounted && user ? (
              <Link href="/dashboard">
                <Button variant="gold" size="sm">My Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="gold" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            <ThemeToggle />
            <Link href="/cart" className="relative h-10 w-10 flex items-center justify-center rounded-lg text-ink-600 dark:text-[#89a895]">
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-ink text-[11px] font-bold flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            <button
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="h-10 w-10 flex items-center justify-center rounded-lg text-ink-600 dark:text-[#89a895] hover:bg-ink-100 dark:hover:bg-[#1b2d20]"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
          <nav
            className="absolute top-[72px] left-0 right-0 bg-white dark:bg-[#0f1611] border-b border-ink-200 dark:border-[#263a2b] shadow-[var(--shadow-lg)] flex flex-col p-4 gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold font-sans text-ink-600 dark:text-[#89a895] hover:bg-ink-100 dark:hover:bg-[#1b2d20] hover:text-ink dark:hover:text-[#dceee3] transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex gap-2 mt-2 pt-3 border-t border-ink-200 dark:border-[#263a2b]">
              {mounted && user ? (
                <Link href="/dashboard" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="gold" size="md" fullWidth>My Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="secondary" size="md" fullWidth>Log In</Button>
                  </Link>
                  <Link href="/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="gold" size="md" fullWidth>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
