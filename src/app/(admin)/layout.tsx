import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { AdminLayout } from "@/components/layout/admin-layout";

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const serviceSupabase = createServiceClient();
  const [{ data: profile }, { count: pendingCount }] = await Promise.all([
    serviceSupabase
      .from("profiles")
      .select("role, first_name, last_name")
      .eq("id", user.id)
      .single(),
    serviceSupabase
      .from("blogs")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const effectiveRole = profile?.role ?? (user.user_metadata?.role as string);
  if (effectiveRole !== "admin") {
    const fallback: Record<string, string> = { vendor: "/studio", user: "/dashboard" };
    redirect(fallback[effectiveRole ?? ""] ?? "/dashboard");
  }

  const firstName = (profile as { first_name?: string | null } | null)?.first_name ?? "";
  const lastName = (profile as { last_name?: string | null } | null)?.last_name ?? "";
  const userName = `${firstName} ${lastName}`.trim() || user.email?.split("@")[0] || "Admin";

  return (
    <AdminLayout userName={userName} pendingCount={pendingCount ?? 0}>
      {children}
    </AdminLayout>
  );
}
