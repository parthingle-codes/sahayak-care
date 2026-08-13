import { createFileRoute } from "@tanstack/react-router";
import { Users, BedDouble, Pill, CalendarClock, HeartPulse, BellRing } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SAHAAYAK Elderly Care" },
      {
        name: "description",
        content:
          "Daily care overview for an elderly care home: residents, bed availability, medicines due and today's appointments.",
      },
      { property: "og:title", content: "Dashboard — SAHAAYAK Elderly Care" },
      {
        property: "og:description",
        content: "See what needs attention today across residents, medicines and appointments.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="What needs attention today"
        description="A single glance at residents, bed availability, medicines due and today's appointments."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active residents" value="—" icon={Users} hint="Awaiting resident records" />
        <StatCard label="Beds available" value="—" icon={BedDouble} tone="info" hint="Awaiting rooms setup" />
        <StatCard label="Medicines due today" value="—" icon={Pill} tone="due" hint="Awaiting schedules" />
        <StatCard
          label="Appointments today"
          value="—"
          icon={CalendarClock}
          tone="done"
          hint="Awaiting appointments"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <EmptyState
          icon={Pill}
          title="No medicine rounds yet"
          description="Once medicines and schedules are set up, pending doses for the current round appear here with a one-tap way to mark them as given."
        />
        <EmptyState
          icon={CalendarClock}
          title="No appointments today"
          description="Doctor visits scheduled for today will be listed here with the resident, time and purpose."
        />
        <EmptyState
          icon={HeartPulse}
          title="No health observations yet"
          description="The latest vitals and care notes recorded by caregivers will appear here."
        />
        <EmptyState
          icon={BellRing}
          title="No alerts"
          description="Missed doses, residents without a bed and missing emergency contacts are surfaced here."
        />
      </div>
    </>
  );
}
