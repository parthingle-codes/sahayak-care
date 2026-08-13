import { createFileRoute } from "@tanstack/react-router";
import { HeartPulse } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/_shell/health-records")({
  head: () => ({
    meta: [
      { title: "Health Records — SAHAAYAK Elderly Care" },
      {
        name: "description",
        content:
          "Recorded vitals and care observations for residents: blood pressure, pulse, temperature, weight and notes.",
      },
      { property: "og:title", content: "Health Records — SAHAAYAK Elderly Care" },
      {
        property: "og:description",
        content: "Record and review daily health observations for each resident.",
      },
    ],
  }),
  component: HealthRecordsPage,
});

function HealthRecordsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Care & Health"
        title="Health records"
        description="Vitals and care observations recorded by caregivers. This is a record-keeping tool, not a medical decision or diagnostic system."
      />
      <EmptyState
        icon={HeartPulse}
        title="No observations recorded yet"
        description="Caregivers will be able to log blood pressure, pulse, temperature, weight, blood sugar and care notes for any resident."
      />
    </>
  );
}
