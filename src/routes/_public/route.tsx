import { createFileRoute, Outlet } from "@tanstack/react-router";

import { PublicLayout } from "@/components/site-shell";

export const Route = createFileRoute("/_public")({
  component: () => (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  ),
});
