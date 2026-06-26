"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Users,
  FileText,
  BarChart2,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "./logo";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", href: "/admin", icon: <LayoutGrid size={18} /> },
  { key: "users", label: "Users", href: "/admin/users", icon: <Users size={18} /> },
  { key: "approvals", label: "Approvals", href: "/admin/approvals", icon: <FileText size={18} /> },
  { key: "products", label: "Products", href: "/admin/products", icon: <Package size={18} /> },
  { key: "orders", label: "Orders", href: "/admin/orders", icon: <ShoppingBag size={18} /> },
  { key: "analytics", label: "Analytics", href: "/admin/analytics", icon: <BarChart2 size={18} /> },
];

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Dashboard", subtitle: "Overview of platform activity" },
  "/admin/users": { title: "Users", subtitle: "Manage members and vendors" },
  "/admin/approvals": { title: "Approvals", subtitle: "Review and approve content submissions" },
  "/admin/products": { title: "Products", subtitle: "Approve, suspend, or remove vendor products" },
  "/admin/orders": { title: "Orders", subtitle: "Track all platform orders" },
  "/admin/create/event": { title: "Create Event", subtitle: "Publish a new event to the platform" },
  "/admin/create/project": { title: "Create Project", subtitle: "Launch a new fundraising project" },
  "/admin/analytics": { title: "Analytics", subtitle: "Platform-wide performance metrics" },
};

interface AdminLayoutProps {
  children: React.ReactNode;
  userName: string;
  pendingCount?: number;
}

export function AdminLayout({ children, userName, pendingCount = 0 }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const meta = PAGE_META[pathname] ?? { title: "Admin", subtitle: "" };
  const pendingBadge = pendingCount > 9 ? "9+" : String(pendingCount);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (item: (typeof NAV_ITEMS)[0]) => {
    if (item.key === "dashboard") return pathname === "/admin";
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 bg-white border-r border-ink-200 flex flex-col">
          <div className="h-16 flex items-center px-5 border-b border-ink-200">
            <Link href="/">
              <Logo height={26} />
            </Link>
          </div>

          <div className="px-3 pt-4 pb-1">
            <span className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink-400 font-sans">
              <ShieldCheck size={11} /> Admin Panel
            </span>
          </div>

          <nav className="flex-1 px-3 pb-4 flex flex-col gap-0.5 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              const showBadge = item.key === "approvals" && pendingCount > 0;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold font-sans transition-colors duration-150",
                    active
                      ? "bg-brand text-white"
                      : "text-ink-600 hover:bg-ink-100 hover:text-ink"
                  )}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {showBadge && !active && (
                    <span className="h-5 min-w-5 px-1 rounded-full bg-warning text-white text-[10px] font-bold flex items-center justify-center">
                      {pendingBadge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="px-3 pb-4 border-t border-ink-200 pt-3 flex flex-col gap-0.5">
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-ink-400 font-sans">
              Account
            </p>
            <Link
              href="/admin/settings"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold font-sans transition-colors duration-150",
                pathname === "/admin/settings"
                  ? "bg-brand text-white"
                  : "text-ink-600 hover:bg-ink-100 hover:text-ink"
              )}
            >
              <Settings size={18} />
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-ink-600 hover:bg-ink-100 hover:text-ink transition-colors duration-150 font-sans"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <header className="h-16 bg-white border-b border-ink-200 flex items-center justify-between px-7 shrink-0">
            <div>
              <h1 className="font-display font-bold text-xl text-ink leading-tight">{meta.title}</h1>
              {meta.subtitle && (
                <p className="text-xs text-ink-500 font-sans leading-tight">{meta.subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {pendingCount > 0 && (
                <button className="relative text-ink-600 hover:text-ink transition-colors">
                  <Bell size={20} />
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-warning text-white text-[9px] font-bold flex items-center justify-center">
                    {pendingBadge}
                  </span>
                </button>
              )}
              <div className="flex items-center gap-2.5">
                <Avatar name={userName} size="sm" />
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-ink font-sans leading-none">{userName}</p>
                  <p className="text-xs text-ink-500 font-sans mt-0.5">Administrator</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-ink-100">{children}</main>
        </div>
      </div>

      <footer className="shrink-0 bg-brand-deep py-2.5 text-center">
        <span className="text-xs text-white/60 font-sans">© 2025 Symbodied LLC — Admin</span>
      </footer>
    </div>
  );
}
