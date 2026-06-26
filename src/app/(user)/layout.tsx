import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const serviceSupabase = createServiceClient();
  const { data: profile } = await serviceSupabase
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") redirect("https://ojudooba.symbodied.com/login");

  const role = (profile?.role === "vendor" ? "vendor" : "user") as "user" | "vendor";
  const firstName: string = profile?.first_name ?? (user.user_metadata?.first_name as string) ?? "";
  const lastName: string = profile?.last_name ?? (user.user_metadata?.last_name as string) ?? "";
  const userName = `${firstName} ${lastName}`.trim() || (user.email ?? "Member");

  return (
    <DashboardLayout role={role} userName={userName}>
      {children}
    </DashboardLayout>
  );
}
