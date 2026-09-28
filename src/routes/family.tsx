import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarClock, HeartHandshake, HeartPulse, LogOut, Stethoscope } from "lucide-react";

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
    if (gate === "signed-out") navigate({ to: "/auth", replace: true });
    if (gate === "staff") navigate({ to: "/dashboard", replace: true });
  }, [gate, navigate]);

  const enabled = gate === "family";
  const { data: residents = [], isLoading: loadingResidents } = useFamilyResidents(enabled);
  const { data: observations = [] } = useFamilyObservations(enabled);
  const { data: appointments = [] } = useFamilyAppointments(enabled);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
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
      <header className="border-b border-border/70 bg-background">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 font-display font-semibold">
            <HeartHandshake className="size-5 text-primary" aria-hidden />
            SAHAAYAK — Family updates
          </div>
          <Button variant="outline" size="sm" onClick={() => void signOut()}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <div>
          <h1 className="font-display text-2xl font-semibold">How your loved one is doing</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A read-only summary shared by the care home. For anything urgent, please call the home
            directly.
          </p>
        </div>

        {loadingResidents ? (
          <Skeleton className="h-48 w-full" />
        ) : residents.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="No resident linked yet"
            description="Your account is not linked to a resident yet. Please ask the care home staff to link your email, or use the same email you gave on the registration form."
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
              <section key={resident.id} className="surface-card space-y-5 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-xl font-semibold">{resident.full_name}</h2>
                  {age ? <Badge variant="secondary">{age}</Badge> : null}
                  <Badge variant="outline" className="capitalize">
                    {resident.mobility}
                  </Badge>
                </div>

                <div className="rounded-lg border border-border/70 bg-secondary/50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CalendarClock className="size-4 text-primary" aria-hidden />
                    Next medical observation
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {nextCheckup
                      ? `${formatDate(nextCheckup.scheduled_on)}${nextCheckup.doctor_name ? ` · Dr. ${nextCheckup.doctor_name}` : ""}${nextCheckup.reason ? ` · ${nextCheckup.reason}` : ""}`
                      : "No checkup scheduled yet — the home will add one soon."}
                  </p>
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
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
                          className="rounded-lg border border-border/60 p-3 text-sm"
                        >
                          <p className="text-xs text-muted-foreground">
                            {new Date(o.recorded_at).toLocaleString()}
                          </p>
                          <p className="mt-1">
                            {[
                              o.bp_systolic && o.bp_diastolic
                                ? `Blood pressure ${o.bp_systolic}/${o.bp_diastolic}`
                                : null,
                              o.pulse ? `Pulse ${o.pulse}` : null,
                              o.temperature_c ? `Temperature ${o.temperature_c}°C` : null,
                              o.blood_sugar ? `Blood sugar ${o.blood_sugar}` : null,
                              o.weight_kg ? `Weight ${o.weight_kg} kg` : null,
                            ]
                              .filter(Boolean)
                              .join(" · ") || "General checkup"}
                          </p>
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
