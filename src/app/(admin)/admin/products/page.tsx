"use client";

import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { naira } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { updateProductStatus } from "@/app/actions/admin";

type Product = {
  id: string; name: string; category: string | null;
  price: number; stock: number; status: string;
  profiles: { first_name: string | null; last_name: string | null } | null;
};

const th = "text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 border-b border-ink-200 bg-ink-100 font-sans";
const td = "px-5 py-4 text-sm text-ink-600 border-b border-ink-200 font-sans";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("products")
      .select("id, name, category, price, stock, status, profiles(first_name, last_name)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts((data as unknown as Product[]) ?? []);
        setLoading(false);
      });
  }, []);

  const setStatus = (id: string, status: string) => {
    setProducts((p) => p.map((x) => (x.id === id ? { ...x, status } : x)));
    startTransition(() => { void updateProductStatus(id, status); });
  };

  const filtered = products.filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const vendorName = (p: Product) => {
    if (!p.profiles) return "—";
    return `${p.profiles.first_name ?? ""} ${p.profiles.last_name ?? ""}`.trim() || "—";
  };

  return (
    <div className="p-7 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-sans font-bold text-xl text-ink">All Products</h2>
        <div className="flex gap-3 text-sm font-sans text-ink-500">
          <span><strong className="text-ink">{products.filter((p) => p.status === "pending").length}</strong> pending</span>
          <span><strong className="text-ink">{products.filter((p) => p.status === "active").length}</strong> active</span>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-200 max-w-xs">
          <Input placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} leadingIcon={<Search size={15} />} />
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <p className="px-5 py-8 text-sm text-ink-400 font-sans text-center">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink-400 font-sans text-center">No products found.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead><tr>
                <th className={th}>Product</th>
                <th className={th}>Vendor</th>
                <th className={th}>Category</th>
                <th className={th}>Price</th>
                <th className={th}>Stock</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-ink-100 transition-colors">
                    <td className={`${td} font-semibold text-ink max-w-52`}><span className="line-clamp-2">{p.name}</span></td>
                    <td className={td}>{vendorName(p)}</td>
                    <td className={td}><Badge tone="brand" size="sm">{p.category ?? "—"}</Badge></td>
                    <td className={td}>{naira(p.price)}</td>
                    <td className={td}>{p.stock}</td>
                    <td className={td}><StatusBadge status={p.status} /></td>
                    <td className={`${td} text-right`}>
                      <div className="inline-flex gap-1.5">
                        {p.status === "pending" && (
                          <Button variant="primary" size="sm" onClick={() => setStatus(p.id, "active")} disabled={pending}>Approve</Button>
                        )}
                        {p.status === "active" && (
                          <Button variant="secondary" size="sm" onClick={() => setStatus(p.id, "suspended")} disabled={pending}>Suspend</Button>
                        )}
                        {p.status === "suspended" && (
                          <Button variant="primary" size="sm" onClick={() => setStatus(p.id, "active")} disabled={pending}>Restore</Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setStatus(p.id, "deleted")} disabled={pending}
                          className="text-error hover:text-error">Delete</Button>
                      </div>
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
