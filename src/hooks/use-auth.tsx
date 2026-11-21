import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { authApi, clearToken, getToken, setToken, type ApiUser } from "@/lib/api";
import { hasStudioAccess } from "@/lib/studio-access";

type AuthState = {
  user: ApiUser | null;
  studioRole: string | null;
  loading: boolean;
  canManageStudio: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const router = useRouter();

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const result = await authApi.me(token);
      setUser(result.user);
    } catch {
      clearToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void refresh().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [refresh]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login({ email, password });
      setToken(result.token);
      setUser(result.user);
      await queryClient.invalidateQueries();
      await router.invalidate();
    },
    [queryClient, router],
  );

  const signUp = useCallback(
    async (input: { fullName: string; email: string; password: string; phone: string }) => {
      const result = await authApi.register(input);
      setToken(result.token);
      setUser(result.user);
      await queryClient.invalidateQueries();
      await router.invalidate();
    },
    [queryClient, router],
  );

  const signOut = useCallback(async () => {
    clearToken();
    setUser(null);
    await queryClient.cancelQueries();
    queryClient.clear();
    await router.invalidate();
  }, [queryClient, router]);

  const studioRole = user && hasStudioAccess(user.role) ? user.role : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        studioRole,
        loading,
        canManageStudio: hasStudioAccess(studioRole),
        signIn,
        signUp,
        signOut,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
