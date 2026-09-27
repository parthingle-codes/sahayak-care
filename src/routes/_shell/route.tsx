import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { supabase } from "@/integrations/supabase/client";

/**
 * Staff-only application shell. The session lives in browser storage, so this
 * layout is client-rendered and gates every child route in one place.
 */
export const Route = createFileRoute("/_shell")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const list = roles?.map((r) => r.role) ?? [];
    if (list.includes("family") && !list.includes("admin") && !list.includes("caregiver")) {
      throw redirect({ to: "/family" });
    }
    return { user: data.user };
  },
  component: ShellLayout,
});

function ShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
