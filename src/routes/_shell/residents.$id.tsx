import { StatusBadge } from "@/components/common/StatusBadge";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, HeartPulse, Stethoscope } from "lucide-react";

import { AppointmentFormDialog } from "@/components/care/AppointmentFormDialog";
import { CompleteObservationDialog } from "@/components/care/CompleteObservationDialog";
import { FamilyAccessCard } from "@/components/care/FamilyAccessCard";
import { ResidentFormDialog } from "@/components/care/ResidentFormDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Panel } from "@/components/common/Panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  useConditions,
  useObservations,
  useResidents,
} from "@/features/care/queries";
import { bucketLabel, bucketOf, daysRemainingLabel, formatDate } from "@/lib/appointments";

export const Route = createFileRoute("/_shell/residents/$id")({
  head: () => ({
    meta: [
      { title: "Resident profile — SAHAYAK Elderly Care" },
      {
        name: "description",
        content:
          "One resident's care profile: room and mobility details, medical conditions, recorded vitals and medical observation schedule.",
      },
      { property: "og:title", content: "Resident profile — SAHAYAK Elderly Care" },
      {
        property: "og:description",
        content: "Everything recorded for one resident, in one place.",
      },
    ],
  }),
  component: ResidentProfilePage,
});

const dash = (v: number | string | null) => (v === null || v === "" ? "—" : String(v));

function ResidentProfilePage() {
  const { id } = Route.useParams();
  const { data: residents = [], isLoading } = useResidents();
  const { data: appointments = [] } = useAppointments();
  const { data: observations = [] } = useObservations();
  const { data: conditions = [] } = useConditions();

  const resident = residents.find((r) => r.id === id);
  const mine = <T extends { resident_id: string }>(rows: T[]) =>
    rows.filter((r) => r.resident_id === id);
  const residentAppointments = mine(appointments);
  const residentObservations = mine(observations);
  const residentConditions = mine(conditions);

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  if (!resident) {
    return (
      <EmptyState
        icon={Stethoscope}
        title="Resident not found"
        description="This resident may have been removed."
        action={
          <Button asChild variant="outline">
            <Link to="/residents">Back to residents</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-2">
        <Link to="/residents">
          <ArrowLeft className="size-4" />
          All residents
        </Link>
      </Button>

      <PageHeader
        eyebrow="Resident profile"
        title={resident.full_name}
        badge={<StatusBadge status={resident.status} />}
        description={[
          resident.room_label ? `Room ${resident.room_label}` : null,
          `Admitted ${new Date(resident.admission_date).toLocaleDateString()}`,
          resident.mobility,
        ]
          .filter(Boolean)
          .join(" · ")}
        actions={
          <>
            <ResidentFormDialog resident={resident} />
            <AppointmentFormDialog residentId={resident.id} />
          </>
        }
      />

      <div className="grid animate-rise gap-6 [animation-delay:60ms]">
        {residentAppointments.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No observations scheduled"
            description="Schedule this resident's medical observation to start the cycle."
          />
        ) : (
          <Panel
            icon={CalendarClock}
            title="Medical observations"
            count={residentAppointments.length}
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Days remaining</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {residentAppointments.map((a) => {
                    const bucket = bucketOf(a);
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="whitespace-nowrap font-medium tabular-nums">
                          {formatDate(a.scheduled_on)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-semibold tabular-nums">
                          {a.status === "completed" ? "—" : daysRemainingLabel(a.scheduled_on)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {a.doctor_name ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{a.reason ?? "—"}</TableCell>
                        <TableCell>
                          <StatusBadge status={bucket} label={bucketLabel[bucket]} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {a.status !== "completed" ? (
                              <CompleteObservationDialog
                                appointment={a}
                                residentName={resident.full_name}
                              />
                            ) : null}
                            <AppointmentFormDialog record={a} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Panel>
        )}

        {residentConditions.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="No conditions recorded"
            description="Add conditions from the Health records page."
          />
        ) : (
          <Panel icon={Stethoscope} title="Medical conditions" count={residentConditions.length}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Condition</TableHead>
                    <TableHead>Diagnosed</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {residentConditions.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.condition}</TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {c.diagnosed_on ? new Date(c.diagnosed_on).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.notes ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Panel>
        )}

        {residentObservations.length === 0 ? (
          <EmptyState
            icon={HeartPulse}
            title="No vitals recorded"
            description="Record vitals from the Health records page."
          />
        ) : (
          <Panel icon={HeartPulse} title="Recorded vitals" count={residentObservations.length}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recorded</TableHead>
                    <TableHead>BP</TableHead>
                    <TableHead>Pulse</TableHead>
                    <TableHead>Temp (°C)</TableHead>
                    <TableHead>Sugar</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {residentObservations.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {new Date(o.recorded_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-semibold tabular-nums">
                        {o.bp_systolic && o.bp_diastolic
                          ? `${o.bp_systolic}/${o.bp_diastolic}`
                          : "—"}
                      </TableCell>
                      <TableCell className="tabular-nums">{dash(o.pulse)}</TableCell>
                      <TableCell className="tabular-nums">{dash(o.temperature_c)}</TableCell>
                      <TableCell className="tabular-nums">{dash(o.blood_sugar)}</TableCell>
                      <TableCell className="tabular-nums">{dash(o.weight_kg)}</TableCell>
                      <TableCell className="text-muted-foreground">{o.note ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Panel>
        )}

        <FamilyAccessCard residentId={resident.id} />
      </div>
    </>
  );
}
