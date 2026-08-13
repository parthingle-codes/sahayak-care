import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/_shell/reports")({
  head: () => ({
    meta: [
      { title: "Reports — SAHAAYAK Elderly Care" },
      {
        name: "description",
        content:
          "Care home reports: occupancy, medicine adherence, health observation activity and visitor summaries.",
      },
      { property: "og:title", content: "Reports — SAHAAYAK Elderly Care" },
      {
        property: "og:description",
        content: "Summaries administrators need for occupancy and daily care activity.",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Reports"
        description="Occupancy, medicine adherence and care activity summaries for administrators."
      />
      <EmptyState
        icon={FileBarChart}
        title="Reports need data first"
        description="Once residents, medicines and observations are recorded, reports summarise occupancy and daily care activity for a chosen period."
      />
    </>
  );
}
