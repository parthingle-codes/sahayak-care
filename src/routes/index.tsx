import { createFileRoute, Link } from "@tanstack/react-router";
import {
  HeartHandshake,
  ShieldCheck,
  Users,
  UserRound,
  UserPlus,
  HandHeart,
} from "lucide-react";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LandingPage,
});

const actions = [
  {
    to: "/register",
    icon: UserPlus,
    label: "Register a resident",
    hint: "Replaces the paper admission form",
    featured: true,
  },
  {
    to: "/family-signin",
    icon: Users,
    label: "Family sign in",
    hint: "See how your loved one is doing",
    featured: false,
  },
  {
    to: "/auth",
    icon: UserRound,
    label: "Staff portal",
    hint: "Administrators and caregivers",
    featured: false,
  },
  {
    to: "/donate",
    icon: HandHeart,
    label: "Donate",
    hint: "Food, clothes, funds or time",
    featured: false,
  },
] as const;

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
  {
    icon: HeartHandshake,
    title: "Families kept close",
    body: "Relatives sign in with the email from the registration form and see their loved one's health updates and upcoming checkups.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-primary/10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <HeartHandshake className="size-5" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold leading-tight">SAHAAYAK</p>
              <p className="text-xs text-muted-foreground">Building technology with compassion</p>
            </div>
          </Link>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/auth">Staff sign in</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 md:px-8 lg:pt-14">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" aria-hidden />
              Elderly care management
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight text-primary md:text-5xl">
              Dignity through precision. Care through clarity.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              SAHAAYAK gives a small old age home one calm place for residents, health
              observations, appointments and beds — replacing scattered registers and files.
            </p>
          </div>

          <div className="mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
            {actions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className={
                  action.featured
                    ? "group flex h-36 flex-col justify-between rounded-3xl bg-primary p-5 text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
                    : "group flex h-36 flex-col justify-between rounded-3xl border border-primary/20 bg-card p-5 shadow-sm transition-transform hover:-translate-y-0.5"
                }
              >
                <span
                  className={
                    action.featured
                      ? "flex size-10 items-center justify-center rounded-full bg-primary-foreground/20"
                      : "flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary"
                  }
                >
                  <action.icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-display font-semibold leading-tight">
                    {action.label}
                  </span>
                  <span
                    className={
                      action.featured
                        ? "mt-0.5 block text-xs text-primary-foreground/70"
                        : "mt-0.5 block text-xs text-muted-foreground"
                    }
                  >
                    {action.hint}
                  </span>
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-5">
            <div className="surface-card overflow-hidden p-0 lg:col-span-3">
              <img
                src={heroImage}
                alt="A caregiver sitting beside an elderly resident in a wheelchair in a bright care home common room"
                width={1600}
                height={1104}
                className="h-full w-full object-cover"
              />
            </div>
            <figure className="relative rounded-4xl border border-primary/10 bg-card p-6 shadow-xl lg:col-span-2">
              <blockquote className="text-sm italic leading-relaxed text-muted-foreground">
                “ Seeing how our father is doing, straight from his care home, gives us peace of
                mind we never thought possible. ”
              </blockquote>
              <figcaption className="mt-4 text-xs font-bold uppercase tracking-widest text-primary">
                A resident's family
              </figcaption>
              <p className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
                Family of a resident?{" "}
                <Link to="/family-signin" className="font-medium text-primary underline">
                  Sign in
                </Link>{" "}
                with the email from the registration form.
              </p>
            </figure>
          </div>
        </section>

        <section className="rounded-t-[40px] bg-card shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.05)]">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="font-display text-2xl font-bold text-primary md:text-3xl">
                Built around the daily routine
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Clinical precision meets human empathy.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-3xl space-y-4">
              {highlights.map((item) => (
                <article
                  key={item.title}
                  className="flex gap-4 rounded-2xl border border-primary/5 bg-background/60 p-5"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-primary shadow-sm">
                    <item.icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-semibold">{item.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground md:text-sm">
                      {item.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-foreground py-12 text-background/60">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HeartHandshake className="size-4" />
            </span>
            <p className="font-display text-lg font-semibold text-primary">SAHAAYAK</p>
          </div>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed">
            A care-management and record-keeping system. It does not diagnose, prescribe or
            replace healthcare professionals.
          </p>
          <p className="mt-6 border-t border-background/10 pt-6 text-xs leading-relaxed">
            SAHAAYAK — a Community Engagement Program project by Computer Science Engineering
            students, Government College of Engineering, Nagpur.
          </p>
        </div>
      </footer>
    </div>
  );
}
