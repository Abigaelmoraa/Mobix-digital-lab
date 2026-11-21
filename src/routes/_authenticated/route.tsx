import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

import { DashboardLayout } from "@/components/site-shell";
import { authApi, getToken } from "@/lib/api";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const token = getToken();
    if (!token) throw redirect({ to: "/auth" });
    try {
      await authApi.me(token);
    } catch {
      throw redirect({ to: "/auth" });
    }
  },
  component: () => (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ),
});
