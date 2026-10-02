import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CalendarClock, Search, User } from "lucide-react";

import { AppointmentFormDialog } from "@/components/care/AppointmentFormDialog";
import { CompleteObservationDialog } from "@/components/care/CompleteObservationDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppointments, useCareSettings, useResidents } from "@/features/care/queries";
import {
  DEFAULT_OBSERVATION_INTERVAL_DAYS,
  bucketLabel,
  buildRows,
  daysRemainingLabel,
  formatDate,
  type AppointmentRow,
} from "@/lib/appointments";

export const Route = createFileRoute("/_shell/appointments")({
  head: () => ({
    meta: [
      { title: "Medical Appointments — SAHAAYAK Elderly Care" },
      {
        name: "description",
        content:
          "Medical observation cycle for every resident: who is due, who is overdue, and what was observed at the last check.",
      },
      { property: "og:title", content: "Medical Appointments — SAHAAYAK Elderly Care" },
      {
        property: "og:description",
        content: "Track each resident's medical observation schedule, ordered by what is due next.",
      },
    ],
  }),
  component: AppointmentsPage,
});

const badgeVariant = (bucket: AppointmentRow["bucket"]) =>
  bucket === "overdue" || bucket === "missed"
    ? ("destructive" as const)
    : bucket === "completed"
      ? ("outline" as const)
      : ("secondary" as const);

function AppointmentTable({ rows }: { rows: AppointmentRow[] }) {
  return (
    <div className="surface-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Resident</TableHead>
            <TableHead>Appointment date</TableHead>
            <TableHead>Days remaining</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ appointment, resident, bucket }) => (
            <TableRow key={appointment.id}>
              <TableCell className="font-medium">
                {resident ? (
                  <Link
                    to="/residents/$id"
                    params={{ id: resident.id }}
                    className="underline-offset-4 hover:underline"
                  >
                    {resident.full_name}
                  </Link>
                ) : (
                  "Unknown resident"
                )}
                {resident?.room_label ? (
                  <span className="block text-sm text-muted-foreground">{resident.room_label}</span>
                ) : null}
              </TableCell>
              <TableCell>{formatDate(appointment.scheduled_on)}</TableCell>
              <TableCell
                className={
                  bucket === "overdue" ? "font-medium text-alert-foreground" : undefined
                }
              >
                {appointment.status === "completed"
                  ? "—"
                  : daysRemainingLabel(appointment.scheduled_on)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {appointment.doctor_name ?? "—"}
              </TableCell>
              <TableCell>
                <StatusBadge status={bucket} label={bucketLabel[bucket]} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  {appointment.status !== "completed" ? (
                    <CompleteObservationDialog
                      appointment={appointment}
                      residentName={resident?.full_name ?? "resident"}
                    />
                  ) : null}
                  <AppointmentFormDialog record={appointment} />
                  {resident ? (
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/residents/$id" params={{ id: resident.id }}>
                        <User className="size-4" />
                        Profile
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function AppointmentsPage() {
  const [query, setQuery] = useState("");
  const { data: residents = [] } = useResidents();
  const { data: appointments = [], isLoading } = useAppointments();
  const { data: settings } = useCareSettings();
  const interval = settings?.observation_interval_days ?? DEFAULT_OBSERVATION_INTERVAL_DAYS;

  const rows = useMemo(() => {
    const all = buildRows(appointments, residents);
    const q = query.trim().toLowerCase();
    return q
      ? all.filter((r) => (r.resident?.full_name ?? "").toLowerCase().includes(q))
      : all;
  }, [appointments, residents, query]);

  const overdue = rows.filter((r) => r.bucket === "overdue");
  const upcoming = rows.filter(
    (r) => r.bucket === "due" || r.bucket === "upcoming",
  );
  const completed = rows.filter((r) => r.bucket === "completed");
  const missed = rows.filter((r) => r.bucket === "missed");

  return (
    <>
      <PageHeader
        eyebrow="Care & Health"
        title="Medical appointments"
        description={`Each resident is seen on a ${interval}-day medical observation cycle. The most urgent checks are listed first.`}
        actions={<AppointmentFormDialog />}
      />

      {residents.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Add a resident first"
          description="Medical observations attach to a resident. Add someone on the Residents page, then schedule their first observation."
        />
      ) : isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No observations scheduled yet"
          description={`Schedule the first medical observation. Once completed, the next one is proposed automatically ${interval} days later.`}
          action={<AppointmentFormDialog />}
        />
      ) : (
        <>
          <div className="relative mb-4 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <label className="sr-only" htmlFor="appt-search">
              Search by resident name
            </label>
            <Input
              id="appt-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by resident name…"
              className="pl-9"
            />
          </div>

          {overdue.length > 0 ? (
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2 text-alert-foreground">
                <AlertTriangle className="size-4" aria-hidden />
                <h2 className="font-display text-lg font-semibold">
                  Overdue observations ({overdue.length})
                </h2>
              </div>
              <AppointmentTable rows={overdue} />
            </div>
          ) : null}

          <Tabs defaultValue="upcoming">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="overdue">Overdue ({overdue.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
              <TabsTrigger value="missed">Missed ({missed.length})</TabsTrigger>
            </TabsList>

            {(
              [
                ["upcoming", upcoming, "No upcoming observations in this list."],
                ["overdue", overdue, "Nothing is overdue — every resident is on schedule."],
                ["completed", completed, "No completed observations recorded yet."],
                ["missed", missed, "No observations were marked missed."],
              ] as const
            ).map(([value, list, empty]) => (
              <TabsContent key={value} value={value} className="mt-4">
                {list.length === 0 ? (
                  <EmptyState icon={CalendarClock} title={empty} description="" />
                ) : (
                  <AppointmentTable rows={list} />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </>
  );
}
