"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid, ShoppingBag, Heart, Package, Bell, Settings,
  LogOut, Image, Calendar, Users, BarChart2, User,
} from "lucide-react";
import { Logo } from "./logo";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Role = "user" | "vendor" | "admin";

const MENUS: Record<Role, { key: string; label: string; href: string; icon: React.ReactNode }[]> = {
  user: [
    { key: "overview", label: "Overview", href: "/dashboard", icon: <LayoutGrid size={18} /> },
    { key: "orders", label: "My Orders", href: "/dashboard/orders", icon: <ShoppingBag size={18} /> },
    { key: "donations", label: "My Donations", href: "/dashboard/donations", icon: <Heart size={18} /> },
    { key: "saved", label: "Saved Items", href: "/dashboard/saved", icon: <Package size={18} /> },
    { key: "profile", label: "Profile", href: "/dashboard/profile", icon: <User size={18} /> },
  ],
  vendor: [
    { key: "overview", label: "Overview", href: "/studio", icon: <LayoutGrid size={18} /> },
    { key: "products", label: "Products", href: "/studio/products", icon: <Package size={18} /> },
    { key: "blogs", label: "Blogs", href: "/studio/blogs", icon: <Image size={18} /> },
    { key: "events", label: "Events", href: "/studio/events", icon: <Calendar size={18} /> },
    { key: "orders", label: "Orders", href: "/studio/orders", icon: <ShoppingBag size={18} /> },
  ],
  admin: [
    { key: "overview", label: "Dashboard", href: "/admin", icon: <LayoutGrid size={18} /> },
    { key: "users", label: "Users", href: "/admin/users", icon: <Users size={18} /> },
    { key: "approvals", label: "Approvals", href: "/admin/approvals", icon: <Image size={18} /> },
    { key: "orders", label: "Orders", href: "/admin/orders", icon: <ShoppingBag size={18} /> },
    { key: "analytics", label: "Analytics", href: "/admin/analytics", icon: <BarChart2 size={18} /> },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  user: "Member",
  vendor: "Vendor Studio",
  admin: "Admin Console",
};

const ROLE_TABS: Record<Role, { r: Role; label: string; href: string }[]> = {
  admin: [
    { r: "user", label: "User", href: "/dashboard" },
    { r: "vendor", label: "Vendor", href: "/studio" },
    { r: "admin", label: "Admin", href: "/admin" },
  ],
  vendor: [
    { r: "user", label: "Account", href: "/dashboard" },
    { r: "vendor", label: "Studio", href: "/studio" },
  ],
  user: [],
};

interface DashboardLayoutProps {
  role: Role;
  children: React.ReactNode;
  title?: string;
  userName?: string;
}

export function DashboardLayout({ role, children, title, userName = "" }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const menu = MENUS[role];
  const tabs = ROLE_TABS[role];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-ink-100">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white border-r border-ink-200 flex flex-col">
        <div className="h-18 flex items-center px-5 border-b border-ink-200">
          <Link href="/">
            <Logo height={26} />
          </Link>
        </div>
        <div className="px-4 py-3 border-b border-ink-200">
          <Badge tone={role === "admin" ? "gold" : "brand"} size="sm">
            {ROLE_LABEL[role]}
          </Badge>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {menu.map((item) => {
            const active = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold font-sans transition-colors duration-200",
                  active
                    ? "bg-brand-light text-brand"
                    : "text-ink-600 hover:bg-ink-100 hover:text-ink"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-ink-200">
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-ink-600 hover:bg-ink-100 hover:text-ink transition-colors duration-200 font-sans"
          >
            <Settings size={18} />Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-ink-600 hover:bg-ink-100 hover:text-ink transition-colors duration-200 font-sans"
          >
            <LogOut size={18} />Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-18 bg-white border-b border-ink-200 flex items-center justify-between px-7 shrink-0">
          <h1 className="font-display font-bold text-2xl text-ink">
            {title ?? ROLE_LABEL[role]}
          </h1>
          <div className="flex items-center gap-6">
            {tabs.length > 0 && (
              <nav className="flex items-center gap-5">
                {tabs.map(({ r, label, href }) => (
                  <Link
                    key={r}
                    href={href}
                    className={cn(
                      "text-sm font-semibold font-sans transition-colors",
                      role === r ? "text-brand" : "text-ink-400 hover:text-ink"
                    )}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            )}
            <button className="relative text-ink-600 hover:text-ink transition-colors">
              <Bell size={21} />
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
  );
}
