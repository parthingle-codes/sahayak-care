import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { Role } from "@/lib/navigation";

type StaffProfile = {
  id: string;
  full_name: string;
  phone: string | null;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: StaffProfile | null;
  role: Role;
  isAdmin: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Holds the signed-in staff member, their profile and their role from
 * `user_roles`. The role drives navigation and admin-only screens.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [role, setRole] = useState<Role>("caregiver");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loadStaff = useCallback(async (userId: string) => {
    // Creates the profile/role rows on first sign-in, then returns the role.
    const { data: ensuredRole } = await supabase.rpc("ensure_staff_account", {
      _full_name: "",
    });

    const [{ data: profileRow }, { data: roleRows }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    setProfile(profileRow ?? null);
    const resolved =
      (roleRows?.some((r) => r.role === "admin") ? "admin" : roleRows?.[0]?.role) ??
      (ensuredRole as Role | null) ??
      "caregiver";
    setRole(resolved as Role);
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session ?? null);
    if (data.session?.user) {
      await loadStaff(data.session.user.id);
    } else {
      setProfile(null);
      setRole("caregiver");
    }
    setLoading(false);
  }, [loadStaff]);

  useEffect(() => {
    let active = true;
    void (async () => {
      await refresh();
      if (!active) return;
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setSession(nextSession ?? null);
      if (nextSession?.user) {
        void loadStaff(nextSession.user.id);
      } else {
        setProfile(null);
        setRole("caregiver");
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [refresh, loadStaff]);

  const signOut = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }, [navigate, queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      role,
      isAdmin: role === "admin",
      loading,
      refresh,
      signOut,
    }),
    [session, profile, role, loading, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}

/** Convenience accessor kept stable for navigation and permission checks. */
export function useRole(): { role: Role; isAdmin: boolean } {
  const { role, isAdmin } = useAuth();
  return { role, isAdmin };
}
