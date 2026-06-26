"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { naira } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  category: string | null;
  price: number;
  stock: number;
  sold: number | null;
  status: string;
};

const th = "text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 border-b border-ink-200 bg-ink-100 font-sans";
const td = "px-5 py-4 text-sm text-ink-600 border-b border-ink-200 font-sans";

export default function StudioProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("products")
        .select("id, name, category, price, stock, sold, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setProducts((data as Product[]) ?? []);
          setLoading(false);
        });
    });
  }, []);

  const filtered = products.filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-7 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-sans font-bold text-xl text-ink">My Products</h2>
        <Link href="/studio/products/create">
          <Button variant="primary" size="sm" leadingIcon={<Plus size={15} />}>Add Product</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: products.length },
          { label: "Active", value: products.filter((p) => p.status === "active").length },
          { label: "Draft", value: products.filter((p) => p.status === "draft").length },
          { label: "Out of Stock", value: products.filter((p) => p.stock === 0).length },
        ].map((s) => (
          <Card key={s.label} padding="md" className="text-center">
            <div className="font-display font-bold text-3xl text-ink leading-none">
              {loading ? "—" : s.value}
            </div>
            <div className="mt-1 text-xs text-ink-500 font-sans">{s.label}</div>
          </Card>
        ))}
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-200 max-w-xs">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leadingIcon={<Search size={15} />}
          />
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <p className="px-5 py-8 text-sm text-ink-400 font-sans text-center">Loading products…</p>
          ) : filtered.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink-400 font-sans text-center">
              {products.length === 0 ? "No products yet. Add your first product." : "No products match your search."}
            </p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={th}>Product</th>
                  <th className={th}>Category</th>
                  <th className={th}>Price</th>
                  <th className={th}>Stock</th>
                  <th className={th}>Sold</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-ink-100 transition-colors">
                    <td className={`${td} font-semibold text-ink max-w-60`}>
                      <span className="line-clamp-2">{p.name}</span>
                    </td>
                    <td className={td}><Badge tone="brand" size="sm">{p.category ?? "—"}</Badge></td>
                    <td className={td}>{naira(p.price)}</td>
                    <td className={td}>
                      {p.stock === 0
                        ? <span className="text-error font-semibold text-xs">Out of stock</span>
                        : p.stock}
                    </td>
                    <td className={td}>{p.sold ?? 0}</td>
                    <td className={td}><StatusBadge status={p.status} /></td>
                    <td className={`${td} text-right`}>
                      <div className="inline-flex gap-1">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" trailingIcon={<ArrowRight size={13} />}>View</Button>
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
