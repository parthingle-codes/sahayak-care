import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartHandshake, ShieldCheck, Users, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import heroImage from "@/assets/care-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SAHAAYAK — Smart Elderly Care & Health Management" },
      {
        name: "description",
        content:
          "A calm, simple platform for small old age homes: resident records, health observations, appointments and bed management in one place.",
      },
      { property: "og:title", content: "SAHAAYAK — Smart Elderly Care & Health Management" },
      {
        property: "og:description",
        content:
          "Building technology with compassion. Less paperwork, organised resident information, faster daily care.",
      },
    ],
  }),
  component: LandingPage,
});

const highlights = [
  {
    icon: Users,
    title: "Every resident in one profile",
    body: "Room and bed, admission details, emergency contacts, medical conditions and care notes, all on one screen.",
  },
  {
    icon: ShieldCheck,
    title: "Right access for each staff role",
    body: "Administrators manage the facility; caregivers focus on the residents in their care. Records stay protected.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 md:px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HeartHandshake className="size-5" />
          </span>
          <div>
            <p className="font-display text-lg font-semibold leading-tight">SAHAAYAK</p>
            <p className="text-xs text-muted-foreground">Building technology with compassion</p>
          </div>
        </div>
        <Button asChild>
          <Link to="/auth">
            Staff sign in
            <ArrowRight />
          </Link>
        </Button>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-16 pt-8 md:px-8 lg:grid-cols-2 lg:pt-14">
          <div>
            <p className="text-eyebrow">Elderly care management</p>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.1] md:text-5xl">
              Care records that keep up with the people giving the care.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              SAHAAYAK gives a small old age home one calm place for residents, health
              observations, appointments and beds — replacing scattered registers and files.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth">
                  Staff sign in
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/register">Register a resident</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              A care-management and record-keeping system. It does not diagnose, prescribe or replace
              healthcare professionals.
            </p>
          </div>
          <div className="surface-card overflow-hidden p-0">
            <img
              src={heroImage}
              alt="A caregiver sitting beside an elderly resident in a wheelchair in a bright care home common room"
              width={1600}
              height={1104}
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        <section className="border-t border-border bg-secondary/60 py-16">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
            <h2 className="text-2xl font-semibold md:text-3xl">Built around the daily routine</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {highlights.map((item) => (
                <article key={item.title} className="surface-card p-6">
                  <span className="flex size-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <item.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto w-full max-w-6xl px-4 text-sm text-muted-foreground md:px-8">
          SAHAAYAK — a Community Engagement Program project by Computer Science Engineering students,
          Government College of Engineering, Nagpur.
        </div>
      </footer>
    </div>
  );
}
