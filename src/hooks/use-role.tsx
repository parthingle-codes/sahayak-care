import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Role } from "@/lib/navigation";

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
  isAdmin: boolean;
};

const RoleContext = createContext<RoleContextValue | null>(null);

/**
 * Holds the active staff role that drives navigation and permissions.
 * Milestone 2 replaces the local state with the signed-in user's role
 * from the `user_roles` table; every consumer keeps working unchanged.
 */
export function RoleProvider({
  children,
  initialRole = "admin",
}: {
  children: ReactNode;
  initialRole?: Role;
}) {
  const [role, setRole] = useState<Role>(initialRole);
  const value = useMemo(() => ({ role, setRole, isAdmin: role === "admin" }), [role]);
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside a RoleProvider");
  return ctx;
}
