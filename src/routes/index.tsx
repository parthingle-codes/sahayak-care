import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  Users,
  UserRound,
  UserPlus,
  HandHeart,
  Building2,
  ClipboardList,
  CalendarClock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import heroImage from "@/assets/care-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SAHAAYAK — Manage elderly care with clarity" },
      {
        name: "description",
        content:
          "One calm place for small old age homes: resident records, health observations, appointments, family updates and online registration.",
      },
      { property: "og:title", content: "SAHAAYAK — Manage elderly care with clarity" },
      {
        property: "og:description",
        content:
          "Building technology with compassion. For care teams, families and facilities.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LandingPage,
});

const paths = [
  {
    audience: "For care teams",
    icon: UserRound,
    title: "Staff sign in",
    body: "Administrators and caregivers manage residents, observations and appointments.",
    cta: "Staff sign in",
    to: "/auth",
    primary: true,
  },
  {
    audience: "For families",
    icon: Users,
    title: "Family access",
    body: "Sign in with the email from the registration form to see your loved one's updates.",
    cta: "Family sign in",
    to: "/family-signin",
    primary: false,
  },
  {
    audience: "For facilities",
    icon: Building2,
    title: "Registration",
    body: "Register a new resident online instead of filling in the paper admission form.",
    cta: "Register a resident",
    to: "/register",
    primary: false,
  },
] as const;

const highlights = [
  { icon: ClipboardList, title: "Every resident in one profile", body: "Admission details, contacts, conditions and care notes on one screen." },
  { icon: CalendarClock, title: "Observations never missed", body: "Recurring medical observations sorted by what is overdue and what is next." },
  { icon: ShieldCheck, title: "Right access for each role", body: "Admins, caregivers and families each see only what they should." },
  { icon: HeartHandshake, title: "Families kept close", body: "A calm, read-only view of health updates and upcoming checkups." },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HeartHandshake className="size-5" aria-hidden />
            </span>
            <span>
              <span className="block font-display text-base font-semibold leading-tight">SAHAAYAK</span>
              <span className="hidden text-xs text-muted-foreground sm:block">Building technology with compassion</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/donate">Donate</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/family-signin">Family sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Staff sign in</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-12 pt-12 md:px-8 lg:grid-cols-2 lg:pt-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Elderly care management
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl">
              Manage care with clarity.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              SAHAAYAK gives small old age homes one calm place for residents, health
              observations, appointments and family updates — replacing scattered registers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth">Staff sign in <ArrowRight aria-hidden /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/family-signin">Family access</Link>
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
            <img
              src={heroImage}
              alt="A caregiver sitting beside an elderly resident in a bright care home common room"
              width={1600}
              height={1104}
              className="aspect-[4/3] h-full w-full object-cover"
            />
          </div>
        </section>

        <section aria-labelledby="paths" className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-8">
          <h2 id="paths" className="sr-only">Choose how you use SAHAAYAK</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {paths.map((p) => (
              <article key={p.title} className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <p.icon className="size-5" aria-hidden />
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{p.audience}</p>
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                <Button asChild className="mt-6 w-full" variant={p.primary ? "default" : "outline"}>
                  <Link to={p.to}>{p.cta} <ArrowRight aria-hidden /></Link>
                </Button>
              </article>
            ))}
          </div>

          <div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <HandHeart className="size-5" aria-hidden />
              </span>
              <div>
                <p className="font-display font-semibold">Support the home</p>
                <p className="text-sm text-muted-foreground">Donate food, clothes, essentials, funds or your time.</p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/donate">Donate</Link>
            </Button>
          </div>
        </section>

        <section className="border-t border-border bg-card">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Built around the daily routine</h2>
            <p className="mt-2 text-muted-foreground">Clear records, fewer missed checkups, families who stay informed.</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((item) => (
                <div key={item.title}>
                  <item.icon className="size-5 text-primary" aria-hidden />
                  <h3 className="mt-3 font-display text-sm font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background py-10">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 md:grid-cols-3 md:px-8">
          <div>
            <p className="font-display font-semibold text-primary">SAHAAYAK</p>
            <p className="mt-2 text-sm text-muted-foreground">
              A care-management and record-keeping system. It does not diagnose, prescribe or replace healthcare professionals.
            </p>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Get started</p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li><Link to="/auth" className="hover:text-primary">Staff sign in</Link></li>
              <li><Link to="/family-signin" className="hover:text-primary">Family sign in</Link></li>
              <li><Link to="/register" className="hover:text-primary">Register a resident</Link></li>
              <li><Link to="/donate" className="hover:text-primary">Donate</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Contact</p>
            <p className="mt-2 text-muted-foreground">
              For admissions, use the online registration form. For other enquiries, please use your usual care-home contact. A Community Engagement Program project, Government College of Engineering, Nagpur.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
