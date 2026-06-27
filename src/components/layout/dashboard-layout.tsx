"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid, FileText, Users, BookOpen, Package,
  Settings, LogOut, Bell, Heart, CalendarDays,
} from "lucide-react";
import { Logo } from "./logo";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Role = "user" | "vendor";

const MAIN_MENU: Record<Role, { key: string; label: string; href: string; icon: React.ReactNode }[]> = {
  user: [
    { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: <LayoutGrid size={18} /> },
    { key: "communities", label: "Communities", href: "/dashboard/communities", icon: <Users size={18} /> },
    { key: "blog-posts", label: "Blog posts", href: "/dashboard/blog-posts", icon: <FileText size={18} /> },
    { key: "resources", label: "Resources", href: "/dashboard/resources", icon: <BookOpen size={18} /> },
    { key: "events", label: "Events", href: "/dashboard/events", icon: <CalendarDays size={18} /> },
    { key: "saved", label: "Saved", href: "/dashboard/saved", icon: <Heart size={18} /> },
  ],
  vendor: [
    { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: <LayoutGrid size={18} /> },
    { key: "communities", label: "Communities", href: "/dashboard/communities", icon: <Users size={18} /> },
    { key: "blog-posts", label: "Blog posts", href: "/dashboard/blog-posts", icon: <FileText size={18} /> },
    { key: "resources", label: "Resources", href: "/dashboard/resources", icon: <BookOpen size={18} /> },
    { key: "products", label: "Products", href: "/studio/products", icon: <Package size={18} /> },
  ],
};

const PAGE_TITLES: Record<string, { title?: string; subtitle?: string }> = {
  "/dashboard/communities": { title: "Community", subtitle: "Connect and collaborate with community members" },
  "/dashboard/blog-posts": { title: "Blog Post", subtitle: "Share your stories and articles" },
  "/dashboard/blog-posts/create": { title: "Create New Post", subtitle: "Share resources, stories, and indigenous knowledge" },
  "/dashboard/resources": { title: "Resources", subtitle: "Access educational materials and research" },
  "/dashboard/events": { title: "My Events", subtitle: "Events you've RSVPd to" },
  "/dashboard/saved": { title: "Saved Items", subtitle: "Products you've saved for later" },
  "/dashboard/settings": { title: "Settings", subtitle: "Manage your account and preferences" },
  "/studio": { title: "Vendor Studio", subtitle: "Manage your content and products" },
  "/studio/products": { title: "Products", subtitle: "Manage your products" },
  "/studio/blogs": { title: "Blog Posts", subtitle: "Manage your blog posts" },
  "/studio/events": { title: "Events", subtitle: "Manage your events" },
  "/studio/orders": { title: "Orders", subtitle: "View your orders" },
};

interface DashboardLayoutProps {
  role: Role;
  children: React.ReactNode;
  userName?: string;
}

export function DashboardLayout({ role, children, userName = "" }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const menu = MAIN_MENU[role];

  const firstName = userName.split(" ")[0] || userName;
  const meta = pathname === "/dashboard"
    ? { title: `Welcome ${firstName}`, subtitle: "Here's what is happening with Symbodied" }
    : (PAGE_TITLES[pathname] ?? { title: "Dashboard", subtitle: "" });

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string, key: string) => {
    if (key === "dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F7F7F7] dark:bg-[#0f1611]">
      {/* Row: sidebar + main content */}
      <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 bg-white dark:bg-[#162018] border-r border-ink-200 dark:border-[#263a2b] flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-ink-200 dark:border-[#263a2b]">
          <Link href="/">
            <Logo height={26} />
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {menu.map((item) => {
            const active = isActive(item.href, item.key);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold font-sans transition-colors duration-150",
                  active
                    ? "bg-brand text-white"
                    : "text-ink-600 dark:text-[#89a895] hover:bg-ink-100 dark:hover:bg-[#1b2d20] hover:text-ink dark:hover:text-[#dceee3]"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 border-t border-ink-200 dark:border-[#263a2b] pt-3">
          <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-ink-400 dark:text-[#4d6356] font-sans">
            Account
          </p>
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold font-sans transition-colors duration-150",
              pathname === "/dashboard/settings"
                ? "bg-brand text-white"
                : "text-ink-600 dark:text-[#89a895] hover:bg-ink-100 dark:hover:bg-[#1b2d20] hover:text-ink dark:hover:text-[#dceee3]"
            )}
          >
            <Settings size={18} />
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-ink-600 dark:text-[#89a895] hover:bg-ink-100 dark:hover:bg-[#1b2d20] hover:text-ink dark:hover:text-[#dceee3] transition-colors duration-150 font-sans"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white dark:bg-[#162018] border-b border-ink-200 dark:border-[#263a2b] flex items-center justify-between px-7 shrink-0">
          <div>
            <h1 className="font-display font-bold text-2xl text-ink dark:text-[#dceee3] leading-tight">
              {meta.title}
            </h1>
            {meta.subtitle && (
              <p className="text-sm text-ink-500 dark:text-[#668074] font-sans leading-tight">{meta.subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="relative text-ink-600 dark:text-[#89a895] hover:text-ink dark:hover:text-[#dceee3] transition-colors">
              <Bell size={20} />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-gold" />
            </button>
            <Avatar name={userName} size="sm" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      </div>

      {/* Footer — full width across sidebar + content */}
      <footer className="shrink-0 bg-brand-deep py-3 text-center">
        <span className="text-xs text-white/70 font-sans">© Copyright 2025 Symbodied</span>
      </footer>
    </div>
  );
}
