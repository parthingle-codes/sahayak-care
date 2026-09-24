import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  AlertTriangle,
  Pill,
  CalendarClock,
  HeartPulse,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { useRegistrations } from "@/features/registrations/queries";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAppointments,
  useCareSettings,
  useObservations,
  useResidents,
} from "@/features/care/queries";
import {
  DEFAULT_OBSERVATION_INTERVAL_DAYS,
  bucketLabel,
  buildRows,
  daysRemainingLabel,
  formatDate,
} from "@/lib/appointments";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SAHAAYAK Elderly Care" },
      {
        name: "description",
        content:
          "Daily care overview for an elderly care home: residents, medical observations due, overdue checks and recent vitals.",
      },
      { property: "og:title", content: "Dashboard — SAHAAYAK Elderly Care" },
      {
        property: "og:description",
        content: "See what needs attention today across residents and medical observations.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: residents = [] } = useResidents();
  const { data: appointments = [] } = useAppointments();
  const { data: observations = [] } = useObservations();
  const { data: settings } = useCareSettings();
  const { data: registrations = [] } = useRegistrations();
  const pendingRegistrations = registrations.filter((r) => r.status === "pending").length;
  const interval = settings?.observation_interval_days ?? DEFAULT_OBSERVATION_INTERVAL_DAYS;

  const rows = buildRows(appointments, residents);
  const overdue = rows.filter((r) => r.bucket === "overdue");
  const dueToday = rows.filter((r) => r.bucket === "due");
  const upcoming = rows.filter((r) => r.bucket === "upcoming");
  const activeResidents = residents.filter((r) => r.status === "active").length;
  const nextUp = [...overdue, ...dueToday, ...upcoming].slice(0, 6);
  const recentObservations = observations.slice(0, 5);
  const nameOf = (id: string) => residents.find((r) => r.id === id)?.full_name ?? "Unknown";

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="What needs attention today"
        description={`Residents are seen on a ${interval}-day medical observation cycle. Overdue checks come first.`}
        actions={
          <Button asChild variant="outline">
            <Link to="/appointments">Open appointments</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active residents" value={activeResidents} icon={Users} />
        <StatCard
          label="Observations overdue"
          value={overdue.length}
          icon={AlertTriangle}
          tone="alert"
          hint={overdue.length ? "Needs attention first" : "Everyone is on schedule"}
        />
        <StatCard
          label="Observations due today"
          value={dueToday.length}
          icon={CalendarClock}
          tone="due"
        />
        <StatCard
          label="Completed observations"
          value={rows.filter((r) => r.bucket === "completed").length}
          icon={CheckCircle2}
          tone="done"
        />
      </div>

      <div className="surface-card mt-4 flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <ClipboardList className="size-5 text-primary" aria-hidden />
          <div>
            <p className="font-medium">Pending registrations: {pendingRegistrations}</p>
            <p className="text-sm text-muted-foreground">
              Online admission forms waiting for staff review.
            </p>
          </div>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/registrations">Review</Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 font-display text-lg font-semibold">Next medical observations</h2>
          {nextUp.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="Nothing scheduled"
              description="Schedule medical observations on the Appointments page to see the cycle here."
            />
          ) : (
            <div className="surface-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resident</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nextUp.map(({ appointment, resident, bucket }) => (
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
                          "Unknown"
                        )}
                      </TableCell>
                      <TableCell>{formatDate(appointment.scheduled_on)}</TableCell>
                      <TableCell>{daysRemainingLabel(appointment.scheduled_on)}</TableCell>
                      <TableCell>
                        <Badge variant={bucket === "overdue" ? "destructive" : "secondary"}>
                          {bucketLabel[bucket]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-2 font-display text-lg font-semibold">Recent vitals</h2>
          {recentObservations.length === 0 ? (
            <EmptyState
              icon={HeartPulse}
              title="No health observations yet"
              description="The latest vitals and care notes recorded by caregivers will appear here."
            />
          ) : (
            <div className="surface-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resident</TableHead>
                    <TableHead>Recorded</TableHead>
                    <TableHead>BP</TableHead>
                    <TableHead>Pulse</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentObservations.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{nameOf(o.resident_id)}</TableCell>
                      <TableCell>{new Date(o.recorded_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {o.bp_systolic && o.bp_diastolic
                          ? `${o.bp_systolic}/${o.bp_diastolic}`
                          : "—"}
                      </TableCell>
                      <TableCell>{o.pulse ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <EmptyState
          icon={Pill}
          title="No medicine rounds yet"
          description="Once medicines and schedules are set up, pending doses for the current round appear here with a one-tap way to mark them as given."
        />
      </div>
    </>
  );
}
