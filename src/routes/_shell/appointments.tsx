import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/_shell/appointments")({
  head: () => ({
    meta: [
      { title: "Appointments — SAHAAYAK Elderly Care" },
      {
        name: "description",
        content: "Doctor appointments for residents with date, purpose, status and visit outcome.",
      },
      { property: "og:title", content: "Appointments — SAHAAYAK Elderly Care" },
      {
        property: "og:description",
        content: "Track upcoming and past doctor visits for every resident.",
      },
    ],
  }),
  component: AppointmentsPage,
});

function AppointmentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Care & Health"
        title="Appointments"
        description="Upcoming doctor visits, who they are for and what happened at past visits."
      />
      <EmptyState
        icon={CalendarClock}
        title="No appointments scheduled"
        description="Appointments will list the resident, doctor, date and purpose, with an outcome note after the visit."
      />
    </>
  );
}
