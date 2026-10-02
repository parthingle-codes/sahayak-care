import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  AlertTriangle,
 
  CalendarClock,
  HeartPulse,
  CheckCircle2,
  ClipboardList,
  HandHeart,
} from "lucide-react";
import { useRegistrations } from "@/features/registrations/queries";
import { useDonations } from "@/features/donations/queries";

import { EmptyState } from "@/components/common/EmptyState";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAuth } from "@/hooks/use-auth";
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
  const { profile } = useAuth();
  const { data: residents = [] } = useResidents();
  const { data: appointments = [] } = useAppointments();
  const { data: observations = [] } = useObservations();
  const { data: settings } = useCareSettings();
  const { data: registrations = [] } = useRegistrations();
  const pendingRegistrations = registrations.filter((r) => r.status === "pending").length;
  const { data: donations = [] } = useDonations();
  const pendingDonations = donations.filter((d) => d.status === "pending").length;
  const interval = settings?.observation_interval_days ?? DEFAULT_OBSERVATION_INTERVAL_DAYS;

  const rows = buildRows(appointments, residents);
  const overdue = rows.filter((r) => r.bucket === "overdue");
  const dueToday = rows.filter((r) => r.bucket === "due");
  const upcoming = rows.filter((r) => r.bucket === "upcoming");
  const activeResidents = residents.filter((r) => r.status === "active").length;
  const nextUp = [...overdue, ...dueToday, ...upcoming].slice(0, 6);
  const recentObservations = observations.slice(0, 5);
  const nameOf = (id: string) => residents.find((r) => r.id === id)?.full_name ?? "Unknown";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = profile?.full_name?.split(" ")[0] || "Care Team";
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-[var(--shadow-lift)] md:p-8">
        <span
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary-foreground/10"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute -bottom-24 right-24 size-48 rounded-full bg-primary-foreground/5"
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary-foreground/75">{today}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              {greeting}, {firstName}
            </h1>
            <p className="mt-2 max-w-xl text-primary-foreground/80">
              Here's what needs your attention today. Residents are seen on a {interval}-day
              medical observation cycle — overdue checks come first.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link to="/register" target="_blank">
                <ClipboardList />
                Registration form
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/appointments">Open appointments</Link>
            </Button>
          </div>
        </div>
      </section>

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
          label="Due today"
          value={dueToday.length}
          icon={CalendarClock}
          tone="due"
          hint={`${upcoming.length} upcoming`}
        />
        <StatCard
          label="Completed observations"
          value={rows.filter((r) => r.bucket === "completed").length}
          icon={CheckCircle2}
          tone="done"
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {[
          {
            icon: ClipboardList,
            title: "Pending registrations",
            count: pendingRegistrations,
            body: "Online admission forms waiting for staff review.",
            to: "/registrations" as const,
          },
          {
            icon: HandHeart,
            title: "Pending donations",
            count: pendingDonations,
            body: "Offers of food, clothing, money or time waiting for review.",
            to: "/donations" as const,
          },
        ].map((item) => (
          <div
            key={item.title}
            className="surface-card flex items-center justify-between gap-4 p-4"
          >
            <div className="flex items-center gap-3">
              <span
                className={
                  item.count
                    ? "flex size-10 items-center justify-center rounded-xl bg-due-soft text-due-foreground"
                    : "flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground"
                }
              >
                <item.icon className="size-5" aria-hidden />
              </span>
              <div>
                <p className="font-medium">
                  {item.title}{" "}
                  <span className="ml-1 font-display tabular-nums">{item.count}</span>
                </p>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </div>
            </div>
            <Button asChild size="sm" variant={item.count ? "default" : "outline"}>
              <Link to={item.to}>Review</Link>
            </Button>
          </div>
        ))}
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
                        <StatusBadge status={bucket} label={bucketLabel[bucket]} />
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
      </div>
    </>
  );
}
