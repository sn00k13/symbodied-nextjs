"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-ink-200 shadow-[var(--shadow-xs)]" style={{ height: "var(--header-height)" }}>
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
                    active ? "text-brand bg-brand-light" : "text-ink-600 hover:text-ink hover:bg-ink-100"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            <button aria-label="Search" className="h-10 w-10 flex items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 transition-colors duration-200">
              <Search size={20} />
            </button>
            <Link href="/cart" aria-label="Cart" className="relative h-10 w-10 flex items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 transition-colors duration-200">
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-ink text-[11px] font-bold flex items-center justify-center font-sans">
                  {count}
                </span>
              )}
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="gold" size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            <Link href="/cart" className="relative h-10 w-10 flex items-center justify-center rounded-lg text-ink-600">
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
              className="h-10 w-10 flex items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100"
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
            className="absolute top-[72px] left-0 right-0 bg-white border-b border-ink-200 shadow-[var(--shadow-lg)] flex flex-col p-4 gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold font-sans text-ink-600 hover:bg-ink-100 hover:text-ink transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex gap-2 mt-2 pt-3 border-t border-ink-200">
              <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="secondary" size="md" fullWidth>Log In</Button>
              </Link>
              <Link href="/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="gold" size="md" fullWidth>Get Started</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
