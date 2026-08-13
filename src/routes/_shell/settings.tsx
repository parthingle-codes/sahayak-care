import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { useRole } from "@/hooks/use-auth";

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
            ? "The first staff account becomes the administrator; caregivers created later can be promoted from here in a later milestone."
            : "You will be able to update your name, phone number and password here once sign-in is enabled."
        }
      />
    </>
  );
}
