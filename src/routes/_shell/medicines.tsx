import { createFileRoute } from "@tanstack/react-router";
import { Pill } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/_shell/medicines")({
  head: () => ({
    meta: [
      { title: "Medicines — SAHAAYAK Elderly Care" },
      {
        name: "description",
        content:
          "Medicine schedules and administration tracking for residents, including pending, given and missed doses.",
      },
      { property: "og:title", content: "Medicines — SAHAAYAK Elderly Care" },
      {
        property: "og:description",
        content: "See today's medicine schedule and mark doses as given in one tap.",
      },
    ],
  }),
  component: MedicinesPage,
});

function MedicinesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Care & Health"
        title="Medicines"
        description="Today's schedule first: pending doses, then given and missed, grouped by round."
      />
      <EmptyState
        icon={Pill}
        title="No medicines added yet"
        description="Medicines with dosage, frequency and scheduled times will generate a daily administration board for caregivers."
      />
    </>
  );
}
