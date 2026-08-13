import { createFileRoute } from "@tanstack/react-router";

import { AdminOnly } from "@/components/common/AdminOnly";
import { BedDouble } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/_shell/rooms")({
  head: () => ({
    meta: [
      { title: "Rooms & Beds — SAHAAYAK Elderly Care" },
      {
        name: "description",
        content: "Room and bed inventory for the care home with occupancy and availability.",
      },
      { property: "og:title", content: "Rooms & Beds — SAHAAYAK Elderly Care" },
      {
        property: "og:description",
        content: "Manage shared rooms, beds and resident bed assignments.",
      },
    ],
  }),
  c    <AdminOnly>
  omponent: RoomsPage,
  });

  function RoomsPage() {
    return (
      <>
        <PageHeader
          eyebrow="Facility"
          title="Rooms & beds"
          description="Shared rooms and individual beds, with occupancy at a glance and safe bed reassignment."
        />
        <EmptyState
          icon={BedDouble}
          title="No rooms configured yet"
          description="Add rooms and their beds so residents can be assigned and bed availability shows on the dashboard."
        />
      </>
    </AdminOnly>
  );
}
