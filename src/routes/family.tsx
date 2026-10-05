import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, CalendarClock, HeartHandshake, HeartPulse, LogOut, Scale, Stethoscope, Thermometer } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useFamilyAppointments,
  useFamilyObservations,
  useFamilyResidents,
} from "@/features/family/queries";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/appointments";

export const Route = createFileRoute("/family")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Family updates — SAHAAYAK" },
      {
        name: "description",
        content:
          "See how your loved one is doing: recent health updates, upcoming checkups and care notes from their care home.",
      },
      { property: "og:title", content: "Family updates — SAHAAYAK" },
      {
        property: "og:description",
        content: "A read-only view of your loved one's care, shared by their care home.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FamilyPage,
});

const dash = (v: number | string | null) => (v === null || v === "" ? "—" : String(v));

function ageOf(dateOfBirth: string | null): string | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return `${age} years`;
}

type Gate = "loading" | "signed-out" | "staff" | "family";

function FamilyPage() {
  const navigate = useNavigate();
  const [gate, setGate] = useState<Gate>("loading");

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!data.user) {
        setGate("signed-out");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      if (!active) return;
      const list = roles?.map((r) => r.role) ?? [];
      setGate(
        list.includes("family") && !list.includes("admin") && !list.includes("caregiver")
          ? "family"
          : "staff",
      );
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (gate === "signed-out") navigate({ to: "/family-signin", replace: true });
    if (gate === "staff") navigate({ to: "/dashboard", replace: true });
  }, [gate, navigate]);

  const enabled = gate === "family";
  const { data: residents = [], isLoading: loadingResidents } = useFamilyResidents(enabled);
  const { data: observations = [] } = useFamilyObservations(enabled);
  const { data: appointments = [] } = useFamilyAppointments(enabled);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/family-signin", replace: true });
  }

  if (!enabled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/40 p-6">
        <Skeleton className="h-64 w-full max-w-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="sticky top-0 z-10 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2 font-display font-semibold">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"><HeartHandshake className="size-5" aria-hidden /></span>
            <span className="min-w-0"><span className="block truncate">SAHAAYAK</span><span className="block text-xs font-normal text-muted-foreground">Family updates</span></span>
          </div>
          <Button variant="outline" size="sm" className="min-h-11" onClick={() => void handleSignOut()}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:py-10">
        <div className="border-b border-border pb-6">
          <p className="text-eyebrow">Shared by the care home</p>
          <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">How your loved one is doing</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A private, read-only summary of recent care records. For anything urgent, please call the home directly.
          </p>
        </div>

        {loadingResidents ? (
          <Skeleton className="h-48 w-full" />
        ) : residents.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="No resident linked yet"
            description="Ask the care home to link your sign-in email. It should match the email used on the registration form."
          />
        ) : (
          residents.map((resident) => {
            const residentObs = observations
              .filter((o) => o.resident_id === resident.id)
              .slice(0, 5);
            const nextCheckup = appointments.find(
              (a) => a.resident_id === resident.id && a.status === "upcoming",
            );
            const age = ageOf(resident.date_of_birth);

            return (
              <section key={resident.id} className="space-y-6">
                <div className="surface-card p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="min-w-0 break-words font-display text-xl font-semibold sm:text-2xl">{resident.full_name}</h2>
                  {age ? <Badge variant="secondary">{age}</Badge> : null}
                  <Badge variant="outline" className="capitalize">
                    {resident.mobility}
                  </Badge>
                </div>

                <div className="mt-5 rounded-lg border border-border bg-secondary/50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CalendarClock className="size-4 text-primary" aria-hidden />
                    Next medical observation
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {nextCheckup
                      ? `${formatDate(nextCheckup.scheduled_on)}${nextCheckup.doctor_name ? ` · ${nextCheckup.doctor_name}` : ""}${nextCheckup.reason ? ` · ${nextCheckup.reason}` : ""}`
                      : "No checkup scheduled yet — the home will add one soon."}
                  </p>
                </div></div>

                <div>
                  <div className="mb-3 flex items-center gap-2 font-display font-semibold">
                    <HeartPulse className="size-4 text-primary" aria-hidden />
                    Recent health updates
                  </div>
                  {residentObs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No health updates recorded yet.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {residentObs.map((o) => (
                        <li
                          key={o.id}
                          className="surface-card p-4 text-sm"
                        >
                          <p className="text-xs text-muted-foreground">
                            {new Date(o.recorded_at).toLocaleString()}
                          </p>
                          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {o.bp_systolic && o.bp_diastolic ? <span className="rounded-lg bg-muted p-2"><Activity className="mb-1 size-4 text-primary" aria-hidden /><span className="block text-xs text-muted-foreground">Blood pressure</span><strong>{o.bp_systolic}/{o.bp_diastolic}</strong></span> : null}
                            {o.pulse ? <span className="rounded-lg bg-muted p-2"><HeartPulse className="mb-1 size-4 text-primary" aria-hidden /><span className="block text-xs text-muted-foreground">Pulse</span><strong>{o.pulse}</strong></span> : null}
                            {o.temperature_c ? <span className="rounded-lg bg-muted p-2"><Thermometer className="mb-1 size-4 text-primary" aria-hidden /><span className="block text-xs text-muted-foreground">Temperature</span><strong>{o.temperature_c} °C</strong></span> : null}
                            {o.weight_kg ? <span className="rounded-lg bg-muted p-2"><Scale className="mb-1 size-4 text-primary" aria-hidden /><span className="block text-xs text-muted-foreground">Weight</span><strong>{o.weight_kg} kg</strong></span> : null}
                          </div>
                          {!o.bp_systolic && !o.pulse && !o.temperature_c && !o.weight_kg && !o.blood_sugar ? <p className="mt-2">General checkup</p> : null}
                          {o.blood_sugar ? <p className="mt-2 text-sm"><span className="text-muted-foreground">Blood sugar:</span> {o.blood_sugar}</p> : null}
                          {o.note ? (
                            <p className="mt-1 text-muted-foreground">{o.note}</p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            );
          })
        )}

        <p className="text-center text-xs text-muted-foreground">
          Wrong person or missing details?{" "}
          <Link to="/" className="underline">
            Contact the care home
          </Link>{" "}
          and they will fix the link.
        </p>
      </main>
    </div>
  );
}
