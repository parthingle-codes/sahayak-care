import { StatusBadge } from "@/components/common/StatusBadge";
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Users } from "lucide-react";

import { ResidentFormDialog } from "@/components/care/ResidentFormDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      { title: "Residents — SAHAYAK Elderly Care" },
      {
        name: "description",
        content:
          "Directory of residents in the care home with room, bed, mobility and admission details.",
      },
      { property: "og:title", content: "Residents — SAHAYAK Elderly Care" },
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

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function ResidentsPage() {
  const { isAdmin } = useRole();
  const { data: residents = [], isLoading } = useResidents();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const visibleResidents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return residents.filter((resident) => {
      const matchesQuery =
        !q ||
        resident.full_name.toLowerCase().includes(q) ||
        resident.room_label?.toLowerCase().includes(q);
      const matchesStatus =
        status === "all" ||
        (status === "active" ? resident.status === "active" : resident.status !== "active");
      return matchesQuery && matchesStatus;
    });
  }, [query, residents, status]);

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
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative max-w-md">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Search by name or room…"
                aria-label="Search residents"
                className="pl-9"
              />
            </div>
            <div
              className="flex w-fit rounded-xl bg-muted p-1"
              aria-label="Filter residents by status"
            >
              {(["all", "active", "inactive"] as const).map((value) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setStatus(value)}
                  className={
                    status === value
                      ? "bg-card! font-semibold capitalize shadow-sm ring-1 ring-inset ring-border"
                      : "capitalize"
                  }
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
          {visibleResidents.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No residents found"
              description="Try a different name, room or status."
            />
          ) : (
            <>
              <div className="grid gap-3 md:hidden">
                {visibleResidents.map((r) => (
                  <article key={r.id} className="surface-card p-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="min-w-0">
                        <Link
                          to="/residents/$id"
                          params={{ id: r.id }}
                          className="font-display font-semibold hover:underline"
                        >
                          {r.full_name}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {age(r.date_of_birth)} years ·{" "}
                          {r.room_label ? `Room ${r.room_label}` : "Room not assigned"}
                        </p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <span className="text-sm text-muted-foreground">
                        {mobilityLabels[r.mobility] ?? r.mobility}
                      </span>
                      <ResidentFormDialog resident={r} />
                    </div>
                  </article>
                ))}
              </div>
              <div className="surface-card hidden overflow-x-auto md:block">
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
                    {visibleResidents.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">
                          <span className="flex items-center gap-2.5">
                            <span
                              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-soft)] text-[11px] font-bold text-primary ring-1 ring-inset ring-primary/15"
                              aria-hidden
                            >
                              {initials(r.full_name)}
                            </span>
                            <Link
                              to="/residents/$id"
                              params={{ id: r.id }}
                              className="underline-offset-4 hover:underline"
                            >
                              {r.full_name}
                            </Link>
                          </span>
                        </TableCell>
                        <TableCell className="tabular-nums">{age(r.date_of_birth)}</TableCell>
                        <TableCell>
                          {r.room_label ? (
                            <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-secondary-foreground ring-1 ring-inset ring-border">
                              {r.room_label}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {mobilityLabels[r.mobility] ?? r.mobility}
                        </TableCell>
                        <TableCell className="whitespace-nowrap tabular-nums">
                          {new Date(r.admission_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={r.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <ResidentFormDialog resident={r} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
