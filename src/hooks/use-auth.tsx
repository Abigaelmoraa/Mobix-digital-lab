import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { hasStudioAccess } from "@/lib/studio-access";

type AuthState = {
  user: User | null;
  studioRole: string | null;
  loading: boolean;
  canManageStudio: boolean;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    studioRole: null,
    loading: true,
    canManageStudio: false,
  });
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let revision = 0;

    const loadIdentity = async () => {
      const currentRevision = ++revision;
      const { data, error } = await supabase.auth.getUser();
      if (!active || currentRevision !== revision) return;
      if (error || !data.user) {
        setState({ user: null, studioRole: null, loading: false, canManageStudio: false });
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      if (!active || currentRevision !== revision) return;
      const studioRole = roles?.find(({ role }) => hasStudioAccess(role))?.role ?? null;
      setState({
        user: data.user,
        studioRole,
        loading: false,
        canManageStudio: hasStudioAccess(studioRole),
      });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      if (event === "SIGNED_OUT") {
        revision += 1;
        setState({ user: null, studioRole: null, loading: false, canManageStudio: false });
      }
      window.setTimeout(() => {
        if (!active) return;
        void loadIdentity();
        void router.invalidate();
        if (event !== "SIGNED_OUT") void queryClient.invalidateQueries();
      }, 0);
    });

    void loadIdentity();
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [queryClient, router]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}