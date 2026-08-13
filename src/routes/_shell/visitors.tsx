import { createFileRoute } from "@tanstack/react-router";
import { UserRoundCheck } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/_shell/visitors")({
  head: () => ({
    meta: [
      { title: "Visitors — SAHAAYAK Elderly Care" },
      {
        name: "description",
        content: "Visitor log for the care home with check-in and check-out times per resident.",
      },
      { property: "og:title", content: "Visitors — SAHAAYAK Elderly Care" },
      { property: "og:description", content: "Record who visited which resident and when." },
    ],
  }),
  component: VisitorsPage,
});

function VisitorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Facility"
        title="Visitors"
        description="A simple visitor log: who came, which resident they visited, and when they left."
      />
      <EmptyState
        icon={UserRoundCheck}
        title="No visitors logged"
        description="Check-ins recorded at the front desk will appear here with the resident and relation."
      />
    </>
  );
}
