import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const serviceSupabase = createServiceClient();
  const { data: profile } = await serviceSupabase
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") redirect("/admin");
  if (profile?.role === "user") redirect("/dashboard");

  const firstName: string = profile?.first_name ?? (user.user_metadata?.first_name as string) ?? "";
  const lastName: string = profile?.last_name ?? (user.user_metadata?.last_name as string) ?? "";
  const userName = `${firstName} ${lastName}`.trim() || (user.email ?? "Vendor");

  return (
    <DashboardLayout role="vendor" userName={userName}>
      {children}
    </DashboardLayout>
  );
}
