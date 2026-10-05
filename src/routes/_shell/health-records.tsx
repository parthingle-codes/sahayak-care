import { createFileRoute } from "@tanstack/react-router";
import { HeartPulse } from "lucide-react";

import { ConditionFormDialog } from "@/components/care/ConditionFormDialog";
import { ObservationFormDialog } from "@/components/care/ObservationFormDialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConditions, useObservations, useResidents } from "@/features/care/queries";

export const Route = createFileRoute("/_shell/health-records")({
  head: () => ({
    meta: [
      { title: "Health Records — SAHAAYAK Elderly Care" },
      {
        name: "description",
        content:
          "Recorded vitals and care observations for residents: blood pressure, pulse, temperature, weight and notes.",
      },
      { property: "og:title", content: "Health Records — SAHAAYAK Elderly Care" },
      {
        property: "og:description",
        content: "Record and review daily health observations for each resident.",
      },
    ],
  }),
  component: HealthRecordsPage,
});

const dash = (v: number | string | null) => (v === null || v === "" ? "—" : String(v));

function HealthRecordsPage() {
  const { data: residents = [] } = useResidents();
  const { data: observations = [], isLoading: loadingObs } = useObservations();
  const { data: conditions = [], isLoading: loadingCond } = useConditions();

  const nameOf = (id: string) => residents.find((r) => r.id === id)?.full_name ?? "Unknown";

  return (
    <>
      <PageHeader
        eyebrow="Care & Health"
        title="Health records"
        description="Vitals and care observations recorded by caregivers. This is a record-keeping tool, not a medical decision or diagnostic system."
        actions={
          <>
            <ConditionFormDialog />
            <ObservationFormDialog />
          </>
        }
      />

      {residents.length === 0 ? (
        <EmptyState
          icon={HeartPulse}
          title="Add a resident first"
          description="Health records attach to a resident. Add someone on the Residents page, then come back to record vitals."
        />
      ) : (
        <Tabs defaultValue="vitals">
          <TabsList>
            <TabsTrigger value="vitals">Vitals ({observations.length})</TabsTrigger>
            <TabsTrigger value="conditions">Conditions ({conditions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="vitals" className="mt-4">
            {loadingObs ? (
              <Skeleton className="h-40 w-full" />
            ) : observations.length === 0 ? (
              <EmptyState
                icon={HeartPulse}
                title="No observations recorded yet"
                description="Use Record vitals to log blood pressure, pulse, temperature, blood sugar, weight and a care note."
              />
            ) : (
              <>
              <div className="grid gap-3 md:hidden">
                {observations.map((o) => (
                  <article key={o.id} className="surface-card p-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="min-w-0"><h3 className="font-display font-semibold">{nameOf(o.resident_id)}</h3><p className="mt-1 text-xs text-muted-foreground">{new Date(o.recorded_at).toLocaleString()}</p></div>
                      <ObservationFormDialog record={o} />
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm">
                      <div><dt className="text-muted-foreground">Blood pressure</dt><dd className="font-medium">{o.bp_systolic || o.bp_diastolic ? `${dash(o.bp_systolic)}/${dash(o.bp_diastolic)}` : "—"}</dd></div>
                      <div><dt className="text-muted-foreground">Pulse</dt><dd className="font-medium">{dash(o.pulse)}</dd></div>
                      <div><dt className="text-muted-foreground">Temperature</dt><dd className="font-medium">{dash(o.temperature_c)}{o.temperature_c ? " °C" : ""}</dd></div>
                      <div><dt className="text-muted-foreground">Weight</dt><dd className="font-medium">{dash(o.weight_kg)}{o.weight_kg ? " kg" : ""}</dd></div>
                    </dl>
                    {o.note ? <p className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">{o.note}</p> : null}
                  </article>
                ))}
              </div>
              <div className="surface-card hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resident</TableHead>
                      <TableHead>Recorded</TableHead>
                      <TableHead>BP</TableHead>
                      <TableHead>Pulse</TableHead>
                      <TableHead>Temp °C</TableHead>
                      <TableHead>Sugar</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead className="text-right">Edit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {observations.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium">{nameOf(o.resident_id)}</TableCell>
                        <TableCell>{new Date(o.recorded_at).toLocaleString()}</TableCell>
                        <TableCell>
                          {o.bp_systolic || o.bp_diastolic
                            ? `${dash(o.bp_systolic)}/${dash(o.bp_diastolic)}`
                            : "—"}
                        </TableCell>
                        <TableCell>{dash(o.pulse)}</TableCell>
                        <TableCell>{dash(o.temperature_c)}</TableCell>
                        <TableCell>{dash(o.blood_sugar)}</TableCell>
                        <TableCell>{dash(o.weight_kg)}</TableCell>
                        <TableCell className="max-w-[18rem] text-muted-foreground">
                          {o.note ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <ObservationFormDialog record={o} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

              </div></>
            )}
          </TabsContent>

          <TabsContent value="conditions" className="mt-4">
            {loadingCond ? (
              <Skeleton className="h-40 w-full" />
            ) : conditions.length === 0 ? (
              <EmptyState
                icon={HeartPulse}
                title="No medical conditions recorded"
                description="Add conditions already diagnosed by a doctor so caregivers see them at a glance."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {conditions.map((c) => (
                  <article key={c.id} className="surface-card flex min-h-40 flex-col p-5">
                    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm text-muted-foreground">{nameOf(c.resident_id)}</p><h3 className="mt-1 break-words font-display text-lg font-semibold">{c.condition}</h3></div><ConditionFormDialog record={c} /></div>
                    <p className="mt-3 text-sm text-muted-foreground">Diagnosed {c.diagnosed_on ? new Date(c.diagnosed_on).toLocaleDateString() : "date not recorded"}</p>
                    <p className="mt-auto pt-4 text-sm text-muted-foreground">{c.notes ?? "No additional notes."}</p>
                  </article>
                ))}
                <div className="hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resident</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Diagnosed on</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Edit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conditions.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{nameOf(c.resident_id)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{c.condition}</Badge>
                        </TableCell>
                        <TableCell>
                          {c.diagnosed_on ? new Date(c.diagnosed_on).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="max-w-[18rem] text-muted-foreground">
                          {c.notes ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <ConditionFormDialog record={c} />
                        </TableCell>
                      </TableRow>
                    ))}

                  </TableBody>
                </Table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}
