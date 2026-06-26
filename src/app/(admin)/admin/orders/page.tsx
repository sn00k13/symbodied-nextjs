"use client";

import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { naira, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { adminUpdateOrderStatus } from "@/app/actions/admin";

type Order = {
  id: string; customer: string | null; product: string | null;
  qty: number | null; total: number | null; status: string; created_at: string | null;
};

const th = "text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 border-b border-ink-200 bg-ink-100 font-sans";
const td = "px-5 py-4 text-sm text-ink-600 border-b border-ink-200 font-sans";
const STATUSES = ["processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("orders")
      .select("id, customer, product, qty, total, status, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setOrders((data as Order[]) ?? []); setLoading(false); });
  }, []);

  const setStatus = (id: string, status: string) => {
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
    startTransition(() => { void adminUpdateOrderStatus(id, status); });
  };

  const filtered = orders.filter(
    (o) => !search || (o.customer ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (o.product ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-7 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-sans font-bold text-xl text-ink">All Orders</h2>
        <div className="flex gap-3 text-sm font-sans text-ink-500">
          {["processing", "shipped", "delivered"].map((s) => (
            <span key={s}><strong className="text-ink">{orders.filter((o) => o.status === s).length}</strong> {s}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: orders.length },
          { label: "Processing", value: orders.filter((o) => o.status === "processing").length },
          { label: "Shipped", value: orders.filter((o) => o.status === "shipped").length },
          { label: "Delivered", value: orders.filter((o) => o.status === "delivered").length },
        ].map((s) => (
          <Card key={s.label} padding="md" className="text-center">
            <div className="font-display font-bold text-3xl text-ink leading-none">{loading ? "—" : s.value}</div>
            <div className="mt-1 text-xs text-ink-500 font-sans">{s.label}</div>
          </Card>
        ))}
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-200 max-w-xs">
          <Input placeholder="Search orders…" value={search} onChange={(e) => setSearch(e.target.value)} leadingIcon={<Search size={15} />} />
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <p className="px-5 py-8 text-sm text-ink-400 font-sans text-center">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink-400 font-sans text-center">No orders yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead><tr>
                <th className={th}>Order ID</th>
                <th className={th}>Customer</th>
                <th className={th}>Product</th>
                <th className={th}>Qty</th>
                <th className={th}>Total</th>
                <th className={th}>Date</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Update</th>
              </tr></thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-ink-100 transition-colors">
                    <td className={td}><span className="font-mono text-xs font-semibold text-ink">{o.id.slice(0, 8)}…</span></td>
                    <td className={`${td} font-semibold text-ink`}>{o.customer ?? "—"}</td>
                    <td className={td}><span className="line-clamp-1">{o.product ?? "—"}</span></td>
                    <td className={td}>{o.qty ?? "—"}</td>
                    <td className={`${td} font-semibold text-ink`}>{o.total != null ? naira(o.total) : "—"}</td>
                    <td className={td}>{formatDate(o.created_at)}</td>
                    <td className={td}><StatusBadge status={o.status} /></td>
                    <td className={`${td} text-right`}>
                      <select
                        value={o.status}
                        disabled={pending}
                        onChange={(e) => setStatus(o.id, e.target.value)}
                        className="text-xs font-sans border border-ink-200 rounded-lg px-2 py-1.5 bg-white text-ink focus:outline-none focus:border-brand"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
