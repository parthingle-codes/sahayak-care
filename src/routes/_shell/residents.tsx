import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/_shell/residents")({
  head: () => ({
    meta: [
      { title: "Residents — SAHAAYAK Elderly Care" },
      {
        name: "description",
        content:
          "Directory of residents in the care home with room, bed, mobility and admission details.",
      },
      { property: "og:title", content: "Residents — SAHAAYAK Elderly Care" },
      {
        property: "og:description",
        content: "Search residents and open a full care profile in one click.",
      },
    ],
  }),
  component: ResidentsPage,
});

function ResidentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Residents"
        description="Every resident of the home with their room, bed, mobility needs and care profile."
      />
      <EmptyState
        icon={Users}
        title="Resident records arrive in the next step"
        description="Resident profiles, admission details, emergency contacts and photos are added once the database is connected."
      />
    </>
  );
}
