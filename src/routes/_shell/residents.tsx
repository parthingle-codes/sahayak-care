import { createFileRoute, Link } from "@tanstack/react-router";
import { Users } from "lucide-react";

import { ResidentFormDialog } from "@/components/care/ResidentFormDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useResidents } from "@/features/care/queries";
import { useRole } from "@/hooks/use-auth";

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

const mobilityLabels: Record<string, string> = {
  independent: "Independent",
  walker: "Uses walker",
  wheelchair: "Wheelchair",
  bedridden: "Bedridden",
};

function age(dob: string | null) {
  if (!dob) return "—";
  const d = new Date(dob);
  const diff = Date.now() - d.getTime();
  return String(Math.floor(diff / (365.25 * 24 * 3600 * 1000)));
}

function ResidentsPage() {
  const { isAdmin } = useRole();
  const { data: residents = [], isLoading } = useResidents();

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Residents"
        description="Every resident of the home with their room, mobility needs and admission details."
        actions={<ResidentFormDialog />}
      />

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : residents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No residents yet"
          description={
            isAdmin
              ? "Add the first resident to start recording health and medical records."
              : "Add the first resident to start recording health and medical records."
          }
          action={<ResidentFormDialog />}
        />
      ) : (
        <div className="surface-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Mobility</TableHead>
                <TableHead>Admitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {residents.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    <Link
                      to="/residents/$id"
                      params={{ id: r.id }}
                      className="underline-offset-4 hover:underline"
                    >
                      {r.full_name}
                    </Link>
                  </TableCell>
                  <TableCell>{age(r.date_of_birth)}</TableCell>
                  <TableCell>{r.room_label ?? "—"}</TableCell>
                  <TableCell>{mobilityLabels[r.mobility] ?? r.mobility}</TableCell>
                  <TableCell>{new Date(r.admission_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "active" ? "secondary" : "outline"}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ResidentFormDialog resident={r} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

