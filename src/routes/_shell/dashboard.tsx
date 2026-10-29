import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ClipboardCheck,
  HandHeart,
  HeartPulse,
  ArrowRight,
} from "lucide-react";
import { useRegistrations } from "@/features/registrations/queries";
import { useDonations } from "@/features/donations/queries";

import { ResidentFormDialog } from "@/components/care/ResidentFormDialog";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useAppointments, useCareSettings, useResidents } from "@/features/care/queries";
import {
  DEFAULT_OBSERVATION_INTERVAL_DAYS,
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
  const { data: settings } = useCareSettings();
  const { data: registrations = [] } = useRegistrations();
  const pendingRegistrations = registrations.filter((r) => r.status === "pending").length;
  const { data: donations = [] } = useDonations();
  const pendingDonations = donations.filter((d) => d.status === "pending").length;
  const interval = settings?.observation_interval_days ?? DEFAULT_OBSERVATION_INTERVAL_DAYS;

  const rows = buildRows(appointments, residents);
  const overdue = rows.filter((r) => r.bucket === "overdue");
  const dueToday = rows.filter((r) => r.bucket === "due");
  const completedCount = rows.filter((r) => r.bucket === "completed").length;
  const activeResidents = residents.filter((r) => r.status === "active").length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = profile?.full_name?.split(" ")[0] || "Care Team";
  const now = new Date();
  const today = `${now.toLocaleDateString(undefined, { weekday: "long" })} · ${now.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}`;

  const firstOverdue = overdue[0];

  return (
    <>
      {/* Page heading: date, greeting, contextual copy, primary actions */}
      <div className="mb-6 flex animate-rise flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-eyebrow">{today}</p>
          <h1 className="mt-1.5 font-display text-3xl font-semibold tracking-tight">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            A clearer view of care, one resident at a time.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2.5">
          <Button asChild variant="outline">
            <Link to="/appointments">
              <CalendarClock aria-hidden />
              View schedule
            </Link>
          </Button>
          <ResidentFormDialog />
        </div>
      </div>

      {/* Hero: blue → ivory → peach gradient with a frosted care-rhythm panel */}
      <section className="relative mb-5 animate-rise overflow-hidden rounded-2xl border border-white/70 bg-[image:var(--gradient-hero)] p-6 shadow-[var(--shadow-card)] [animation-delay:60ms] md:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
              Your care overview
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-[28px]">
              Care feels better when nothing is missed.
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">
              Keep resident information, health observations and appointments organised in one calm
              workspace.
            </p>
          </div>

          <div className="surface-glass w-full rounded-2xl p-4 lg:w-[320px]">
            <div className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary ring-1 ring-inset ring-primary/10">
                <HeartPulse className="size-6" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Care rhythm
                </p>
                <p className="mt-0.5 font-display text-base font-semibold">
                  {interval}-day observation cycle
                </p>
              </div>
            </div>
            <p className="mt-2.5 text-[13px] text-muted-foreground">
              A steady rhythm for consistent follow-up.
            </p>
            <div className="mt-3 flex gap-1.5" aria-hidden>
              <span className="h-1.5 flex-1 rounded-full bg-primary" />
              <span className="h-1.5 flex-1 rounded-full bg-primary/35" />
              <span className="h-1.5 flex-1 rounded-full bg-muted" />
            </div>
          </div>
        </div>
      </section>

      {/* Overview statistics */}
      <div className="grid animate-rise gap-4 sm:grid-cols-2 xl:grid-cols-4 [animation-delay:120ms]">
        <StatCard
          label="Active residents"
          value={activeResidents}
          subtext="currently staying"
          icon={Users}
        />
        <StatCard
          label="Observations overdue"
          value={overdue.length}
          subtext={overdue.length ? "needs attention" : "on schedule"}
          subtextAlert={overdue.length > 0}
          icon={AlertTriangle}
          tone="alert"
          hint={overdue.length ? "Review the overdue care record" : "Everyone is on schedule"}
        />
        <StatCard
          label="Due today"
          value={dueToday.length}
          subtext="observations due"
          icon={CalendarClock}
          tone="due"
          hint={
            dueToday.length
              ? `${dueToday.length} checks scheduled for today`
              : "No checks due today"
          }
        />
        <StatCard
          label="Completed observations"
          value={completedCount}
          subtext="recorded to date"
          icon={CheckCircle2}
          tone="done"
          hint="Recorded in health records"
        />
      </div>

      {/* Pending workflow summaries */}
      <div className="mt-4 grid animate-rise gap-4 md:grid-cols-2 [animation-delay:160ms]">
        {[
          {
            icon: ClipboardList,
            title: "Pending registrations",
            count: pendingRegistrations,
            body: "Online admission forms waiting for staff review.",
            to: "/registrations" as const,
            tone: "blue" as const,
          },
          {
            icon: HandHeart,
            title: "Pending donations",
            count: pendingDonations,
            body: "Offers of essentials, funds or time awaiting review.",
            to: "/donations" as const,
            tone: "amber" as const,
          },
        ].map((item) => (
          <div
            key={item.title}
            className="surface-card group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
          >
            <div className="flex min-w-0 items-center gap-3.5">
              <span
                className={
                  item.tone === "blue"
                    ? "flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary ring-1 ring-inset ring-primary/10"
                    : "flex size-11 shrink-0 items-center justify-center rounded-xl bg-due-soft text-due-foreground ring-1 ring-inset ring-due/15"
                }
              >
                <item.icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {item.title}
                  <span
                    className={
                      item.tone === "blue"
                        ? "rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold tabular-nums text-primary ring-1 ring-inset ring-primary/15"
                        : item.count
                          ? "rounded-full bg-due-soft px-2 py-0.5 text-xs font-bold tabular-nums text-due-foreground ring-1 ring-inset ring-due/25"
                          : "rounded-full bg-muted px-2 py-0.5 text-xs font-bold tabular-nums text-muted-foreground ring-1 ring-inset ring-border"
                    }
                  >
                    {item.count}
                  </span>
                </p>
                <p className="mt-1 text-sm leading-snug text-muted-foreground">{item.body}</p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to={item.to}>
                Review <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </Button>
          </div>
        ))}
      </div>

      {/* Care priority + observation rhythm */}
      <div className="mt-6 grid animate-rise gap-4 lg:grid-cols-3 [animation-delay:200ms]">
        <section className="surface-card overflow-hidden lg:col-span-2">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
            <div>
              <h2 className="font-display text-base font-semibold tracking-tight">
                Care needs your attention
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Prioritised health observations and follow-ups
              </p>
            </div>
            {overdue.length > 0 ? (
              <StatusBadge status="overdue" label={`${overdue.length} overdue`} />
            ) : (
              <StatusBadge status="stable" label="All on schedule" />
            )}
          </header>

          <div className="space-y-3 p-5">
            {overdue.length > 0 && firstOverdue ? (
              <div className="flex flex-col gap-3 rounded-xl border border-alert/20 bg-alert-soft/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-alert-soft text-alert-foreground ring-1 ring-inset ring-alert/20">
                    <AlertTriangle className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold">Medical observation follow-up</p>
                    <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                      {firstOverdue.resident ? `${firstOverdue.resident.full_name} · ` : ""}
                      {formatDate(firstOverdue.appointment.scheduled_on)} —{" "}
                      {daysRemainingLabel(firstOverdue.appointment.scheduled_on)}. An observation is
                      overdue in the recurring care cycle.
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge status="overdue" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Staff review required
                      </span>
                      {overdue.length > 1 ? (
                        <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold tabular-nums text-alert-foreground ring-1 ring-inset ring-alert/20">
                          +{overdue.length - 1} more
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <Button asChild size="sm" className="shrink-0">
                  <Link to="/appointments">
                    Review record <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </Button>
              </div>
            ) : null}

            {dueToday.length > 0 ? (
              <div className="flex flex-col gap-3 rounded-xl border border-due/20 bg-due-soft/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-due-soft text-due-foreground ring-1 ring-inset ring-due/20">
                    <CalendarClock className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold">Observations due today</p>
                    <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                      {dueToday.length} checkup{dueToday.length > 1 ? "s are" : " is"} scheduled for
                      today across the home.
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge status="due" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Due within today's cycle
                      </span>
                    </div>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline" className="shrink-0">
                  <Link to="/appointments">
                    Open schedule <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </Button>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 rounded-xl border border-done/20 bg-done-soft/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-done-soft text-done-foreground ring-1 ring-inset ring-done/20">
                  <ClipboardCheck className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">Keep the care plan up to date</p>
                  <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                    Review notes after each observation to maintain continuity.
                  </p>
                </div>
              </div>
              <Button asChild size="sm" variant="ghost" className="shrink-0 text-primary">
                <Link to="/health-records">
                  Open health records <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </Button>
            </div>

            <p className="pt-1 text-xs text-muted-foreground">
              SAHAAYAK helps organise care information. It does not replace clinical judgement.
            </p>
          </div>
        </section>

        <section className="flex flex-col rounded-xl border border-primary/15 bg-primary-soft/50 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold tracking-tight">
                A steady rhythm of care
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Designed around recurring follow-up
              </p>
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-primary ring-1 ring-inset ring-primary/10">
              <CalendarClock className="size-4.5" aria-hidden />
            </span>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <span className="font-display text-4xl font-semibold leading-none tracking-tight text-primary tabular-nums">
                {interval}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Day observation cycle</p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  A recurring rhythm that helps caregivers track upcoming and overdue observations.
                </p>
              </div>
            </div>
          </div>

          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { text: "Record observations consistently", tone: "bg-primary" },
              { text: "Keep follow-ups visible to the care team", tone: "bg-primary" },
              { text: "Prioritise items that need attention", tone: "bg-alert" },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-2.5 text-foreground/85">
                <span
                  className={`mt-1.5 size-1.5 shrink-0 rounded-full ${item.tone}`}
                  aria-hidden
                />
                {item.text}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Page footer */}
      <div className="mt-6 flex flex-col gap-1 border-t border-border/70 pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>SAHAAYAK helps organise care information. It does not replace clinical judgement.</p>
        <p className="shrink-0">Designed for care teams · Built with compassion</p>
      </div>
    </>
  );
}
