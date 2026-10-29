import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  Globe,
  HeartHandshake,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  facilityLocation,
  fetchPublishedFacilities,
  parseReviewLinks,
  type Facility,
} from "@/features/directory/queries";

export const Route = createFileRoute("/homes")({
  loader: () => fetchPublishedFacilities(),
  head: () => ({
    meta: [
      { title: "Find elderly care homes — SAHAYAK" },
      {
        name: "description",
        content:
          "Browse a public directory of old age homes. Every listing is published by the home's administrator and verified before it appears here.",
      },
      { property: "og:title", content: "Find elderly care homes — SAHAYAK" },
      {
        property: "og:description",
        content:
          "A public directory of verified old age homes, with contact details, location and directions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomesPage,
  pendingComponent: HomesPending,
});

function HomesPending() {
  return (
    <div className="public-canvas min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
        <div className="mb-8 space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function HomesPage() {
  const facilities = Route.useLoaderData();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return facilities;
    return facilities.filter((f) =>
      [f.name, f.city, f.state, f.country]
        .filter(Boolean)
        .some((part) => String(part).toLowerCase().includes(q)),
    );
  }, [facilities, query]);

  return (
    <div className="public-canvas min-h-screen">
      <PublicBar />

      <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
        <p className="text-eyebrow text-primary">Public directory</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
          Find an elderly care home
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
          Every listing below is published by the home's own administrator and verified by the
          SAHAYAK team before it appears here.
        </p>

        {facilities.length > 0 ? (
          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or city…"
                aria-label="Search homes by name or city"
                className="pl-9"
              />
            </div>
          </div>
        ) : null}

        {facilities.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={Building2}
              title="No homes listed yet"
              description="Verified listings will appear here as care homes publish them. Please check back soon."
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={Search}
              title="No homes match your search"
              description="Try a different name or city."
              action={
                <Button variant="outline" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((f) => (
              <FacilityCard key={f.id} facility={f} />
            ))}
          </div>
        )}

        <p className="mt-10 text-sm text-muted-foreground">
          Are you a care-home administrator?{" "}
          <Link to="/auth" className="font-medium text-primary hover:underline">
            Sign in to manage your listing
          </Link>
          .
        </p>
      </main>

      <PublicFooter />
    </div>
  );
}

function FacilityCard({ facility: f }: { facility: Facility }) {
  const reviewLinks = parseReviewLinks(f.review_links);
  const location = facilityLocation(f);
  return (
    <article className="surface-card animate-rise flex flex-col gap-4 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[image:var(--gradient-soft)] text-primary ring-1 ring-inset ring-primary/10">
            <Building2 className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="break-words font-display text-lg font-semibold leading-snug">
              {f.name}
            </h2>
            {location ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" aria-hidden />
                {location}
              </p>
            ) : null}
          </div>
        </div>
        <StatusBadge status="verified" tone="done" label="Verified" />
      </div>

      {f.summary ? (
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{f.summary}</p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <Button asChild size="sm">
          <Link to="/homes/$slug" params={{ slug: f.slug }}>
            View details <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
        {f.phone ? (
          <Button asChild variant="outline" size="sm">
            <a href={`tel:${f.phone}`}>
              <Phone className="size-4" aria-hidden /> Call
            </a>
          </Button>
        ) : null}
        {f.website_url ? (
          <Button asChild variant="outline" size="sm">
            <a href={f.website_url} target="_blank" rel="noopener noreferrer">
              <Globe className="size-4" aria-hidden /> Website
            </a>
          </Button>
        ) : null}
        {f.map_url ? (
          <Button asChild variant="outline" size="sm">
            <a href={f.map_url} target="_blank" rel="noopener noreferrer">
              <MapPin className="size-4" aria-hidden /> Directions
            </a>
          </Button>
        ) : null}
        {reviewLinks.length > 0 ? (
          <Button asChild variant="ghost" size="sm">
            <Link to="/homes/$slug" params={{ slug: f.slug }}>
              <Star className="size-4" aria-hidden /> Reviews
            </Link>
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export function PublicBar() {
  return (
    <header className="glass-bar sticky top-0 z-40 border-b">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[image:var(--gradient-soft)] text-primary shadow-sm ring-1 ring-inset ring-white/60">
            <HeartHandshake className="size-5" aria-hidden />
          </span>
          <span>
            <span className="block font-display text-base font-semibold leading-tight">
              SAHAYAK
            </span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Find elderly care homes
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/">Home</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/register">Register a resident</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth">Staff sign in</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
        <p>
          Listings are published by each home's administrator and verified by the SAHAYAK team.
          SAHAYAK does not host ratings or reviews.
        </p>
        <p className="shrink-0">
          A Community Engagement Program project, Government College of Engineering, Nagpur.
        </p>
      </div>
    </footer>
  );
}
