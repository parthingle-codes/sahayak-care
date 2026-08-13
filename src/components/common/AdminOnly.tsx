import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { useRole } from "@/hooks/use-auth";

/**
 * Renders admin-only screens. Caregivers see a calm explanation instead of the
 * facility management tools; the database policies enforce the same boundary.
 */
export function AdminOnly({ children }: { children: ReactNode }) {
  const { isAdmin } = useRole();
  if (isAdmin) return <>{children}</>;

  return (
    <EmptyState
      icon={ShieldAlert}
      title="Administrator access only"
      description="This section is managed by the care home administrator. Ask them for access if you need changes here."
    />
  );
}
