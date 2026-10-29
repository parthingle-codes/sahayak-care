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
        content: "Building technology with compassion. For care teams, families and facilities.",
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
  {
    icon: ClipboardList,
    title: "Every resident in one profile",
    body: "Admission details, contacts, conditions and care notes on one screen.",
  },
  {
    icon: CalendarClock,
    title: "Observations never missed",
    body: "Recurring medical observations sorted by what is overdue and what is next.",
  },
  {
    icon: ShieldCheck,
    title: "Right access for each role",
    body: "Admins, caregivers and families each see only what they should.",
  },
  {
    icon: HeartHandshake,
    title: "Families kept close",
    body: "A calm, read-only view of health updates and upcoming checkups.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen public-canvas overflow-x-clip">
      <header className="glass-bar sticky top-0 z-50 border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[image:var(--gradient-soft)] text-primary shadow-sm ring-1 ring-inset ring-white/60">
              <HeartHandshake className="size-5" aria-hidden />
            </span>
            <span>
              <span className="block font-display text-base font-semibold leading-tight">
                SAHAAYAK
              </span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                Building technology with compassion
              </span>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link to="/homes">Find homes</Link>
            </Button>
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
        <section className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-12 pt-12 md:px-8 lg:grid-cols-2 lg:pt-16">
          {/* Organic forms: cream light + mint ring, layered under the copy */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-0 size-72 rounded-full bg-white/60 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 bottom-0 size-40 rounded-full border border-primary/20"
          />
          <div className="relative animate-rise">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
              Elderly care management
            </p>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl">
              Manage <span className="text-primary">care</span> with clarity.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              SAHAAYAK gives small old age homes one calm place for residents, health observations,
              appointments and family updates — replacing scattered registers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth">
                  Staff sign in <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/family-signin">Family access</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/homes">
                  <Building2 aria-hidden /> Explore care homes
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative animate-rise [animation-delay:120ms]">
            <div className="overflow-hidden rounded-3xl border-4 border-white/70 shadow-[var(--shadow-lift)] ring-1 ring-primary/10">
              <img
                src={heroImage}
                alt="A caregiver sitting beside an elderly resident in a bright care home common room"
                width={1600}
                height={1104}
                className="aspect-[4/3] h-full w-full object-cover"
              />
            </div>
            {/* Floating glass chip — a real link into the directory */}
            <Link
              to="/homes"
              className="surface-glass absolute -bottom-5 left-4 flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] sm:left-8"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[image:var(--gradient-soft)] text-primary ring-1 ring-inset ring-primary/10">
                <Building2 className="size-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">Care home directory</span>
                <span className="block text-xs text-muted-foreground">
                  Browse verified old age homes
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-primary" aria-hidden />
            </Link>
          </div>
        </section>

        <section aria-labelledby="paths" className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-8">
          <h2 id="paths" className="sr-only">
            Choose how you use SAHAAYAK
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {paths.map((p, i) => (
              <article
                key={p.title}
                className="surface-card animate-rise flex flex-col p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary ring-1 ring-inset ring-primary/10">
                    <p.icon className="size-5" aria-hidden />
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {p.audience}
                  </p>
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
                <Button asChild className="mt-6 w-full" variant={p.primary ? "default" : "outline"}>
                  <Link to={p.to}>
                    {p.cta} <ArrowRight aria-hidden />
                  </Link>
                </Button>
              </article>
            ))}
          </div>

          <div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-xl border border-primary/30 bg-primary-soft/40 p-6 transition-colors duration-200 hover:border-primary/50 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="size-5" aria-hidden />
              </span>
              <div>
                <p className="font-display font-semibold">Find elderly care homes</p>
                <p className="text-sm text-muted-foreground">
                  Browse the public directory of verified old age homes — contact details, location
                  and directions.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link to="/homes">
                Explore care homes <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>

          <div className="surface-card mt-4 flex flex-col items-start justify-between gap-4 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <HandHeart className="size-5" aria-hidden />
              </span>
              <div>
                <p className="font-display font-semibold">Support the home</p>
                <p className="text-sm text-muted-foreground">
                  Donate food, clothes, essentials, funds or your time.
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/donate">Donate</Link>
            </Button>
          </div>
        </section>

        <section className="border-y border-border/60 bg-card/60 backdrop-blur-xl">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Built around the daily routine
            </h2>
            <p className="mt-2 text-muted-foreground">
              Clear records, fewer missed checkups, families who stay informed.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((item) => (
                <div key={item.title}>
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[image:var(--gradient-soft)] text-primary ring-1 ring-inset ring-primary/10">
                    <item.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-3 font-display text-sm font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-card/50 py-10 backdrop-blur-md">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 md:grid-cols-3 md:px-8">
          <div>
            <p className="font-display font-semibold text-primary">SAHAAYAK</p>
            <p className="mt-2 text-sm text-muted-foreground">
              A care-management and record-keeping system. It does not diagnose, prescribe or
              replace healthcare professionals.
            </p>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Get started</p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>
                <Link to="/homes" className="hover:text-primary">
                  Find elderly care homes
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-primary">
                  Staff sign in
                </Link>
              </li>
              <li>
                <Link to="/family-signin" className="hover:text-primary">
                  Family sign in
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary">
                  Register a resident
                </Link>
              </li>
              <li>
                <Link to="/donate" className="hover:text-primary">
                  Donate
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Contact</p>
            <p className="mt-2 text-muted-foreground">
              For admissions, use the online registration form. For other enquiries, please use your
              usual care-home contact. A Community Engagement Program project, Government College of
              Engineering, Nagpur.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
