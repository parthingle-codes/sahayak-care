import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SAHAAYAK Elderly Care" },
      {
        name: "description",
        content: "Manage staff accounts, roles and your own profile in the care platform.",
      },
      { property: "og:title", content: "Settings — SAHAAYAK Elderly Care" },
      { property: "og:description", content: "Staff accounts, roles and personal profile." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { isAdmin } = useRole();

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description={
          isAdmin
            ? "Staff accounts, role assignment and facility preferences."
            : "Your profile and personal preferences."
        }
      />
      <EmptyState
        icon={SettingsIcon}
        title="Accounts arrive with sign-in"
        description={
          isAdmin
            ? "Administrators will invite caregivers here and assign roles once authentication is enabled."
            : "You will be able to update your name, phone number and password here once sign-in is enabled."
        }
      />
    </>
  );
}
