import { redirect } from "next/navigation";

export default function AdminRootLayout() {
  redirect("/dashboard");
}
