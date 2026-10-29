import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  MessageSquareQuote,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  facilityLocation,
  fetchPublishedFacility,
  parseReviewLinks,
} from "@/features/directory/queries";
import { PublicBar, PublicFooter } from "@/routes/homes";

export const Route = createFileRoute("/homes/$slug")({
  loader: async ({ params }) => {
    const facility = await fetchPublishedFacility(params.slug);
    if (!facility) throw notFound();
    return facility;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.name} — Find elderly care homes | SAHAYAK`
          : "Home not found — SAHAYAK",
      },
      {
        name: "description",
        content:
          loaderData?.summary ?? "Verified old age home listing on the SAHAYAK public directory.",
      },
      { property: "og:title", content: loaderData ? `${loaderData.name} — SAHAYAK` : "SAHAYAK" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FacilityProfilePage,
  notFoundComponent: FacilityNotFound,
});

function FacilityNotFound() {
  return (
    <div className="public-canvas min-h-screen">
      <PublicBar />
      <main className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8">
        <EmptyState
          icon={Building2}
          title="Listing not found"
          description="This home may have been unpublished, or the web address may be wrong."
          action={
            <Button asChild>
              <Link to="/homes">Browse all homes</Link>
            </Button>
          }
        />
      </main>
      <PublicFooter />
    </div>
  );
}

function FacilityProfilePage() {
  const f = Route.useLoaderData();
  const reviewLinks = parseReviewLinks(f.review_links);
  const location = facilityLocation(f);
  const addressParts = [f.address_line, f.city, f.state, f.postal_code, f.country].filter(Boolean);

  return (
    <div className="public-canvas min-h-screen">
      <PublicBar />

      <main className="mx-auto w-full max-w-5xl px-4 py-10 md:px-8">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
          <Link to="/homes">
            <ArrowLeft className="size-4" aria-hidden /> All homes
          </Link>
        </Button>

        {/* Header */}
        <div className="surface-card animate-rise p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="break-words font-display text-3xl font-bold tracking-tight">
                {f.name}
              </h1>
              {location ? (
                <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="size-4 shrink-0" aria-hidden />
                  {location}
                </p>
              ) : null}
            </div>
            <StatusBadge status="verified" tone="done" label="Verified listing" />
          </div>

          {f.summary ? (
            <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">{f.summary}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {f.phone ? (
              <Button asChild size="sm">
                <a href={`tel:${f.phone}`}>
                  <Phone className="size-4" aria-hidden /> Call {f.phone}
                </a>
              </Button>
            ) : null}
            {f.website_url ? (
              <Button asChild variant="outline" size="sm">
                <a href={f.website_url} target="_blank" rel="noopener noreferrer">
                  <Globe className="size-4" aria-hidden /> Visit website
                </a>
              </Button>
            ) : null}
            {f.map_url ? (
              <Button asChild variant="outline" size="sm">
                <a href={f.map_url} target="_blank" rel="noopener noreferrer">
                  <MapPin className="size-4" aria-hidden /> Get directions
                </a>
              </Button>
            ) : null}
            {reviewLinks.length > 0 ? (
              <Button asChild variant="outline" size="sm">
                <a href="#reviews">
                  <MessageSquareQuote className="size-4" aria-hidden /> External reviews
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            {/* About */}
            {f.description ? (
              <section className="surface-card animate-rise p-6 md:p-8">
                <h2 className="font-display text-xl font-semibold">About this home</h2>
                <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </section>
            ) : null}

            {/* Contact & location */}
            <section className="surface-card animate-rise p-6 md:p-8">
              <h2 className="font-display text-xl font-semibold">Contact &amp; location</h2>
              <dl className="mt-4 space-y-4">
                {addressParts.length > 0 ? (
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <div>
                      <dt className="text-sm font-semibold">Address</dt>
                      <dd className="mt-0.5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                        {addressParts.join("\n")}
                      </dd>
                    </div>
                  </div>
                ) : null}
                {f.phone ? (
                  <div className="flex gap-3">
                    <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <div>
                      <dt className="text-sm font-semibold">Phone</dt>
                      <dd className="mt-0.5 text-sm">
                        <a href={`tel:${f.phone}`} className="text-primary hover:underline">
                          {f.phone}
                        </a>
                      </dd>
                    </div>
                  </div>
                ) : null}
                {f.contact_email ? (
                  <div className="flex gap-3">
                    <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <div>
                      <dt className="text-sm font-semibold">Email</dt>
                      <dd className="mt-0.5 text-sm">
                        <a
                          href={`mailto:${f.contact_email}`}
                          className="break-all text-primary hover:underline"
                        >
                          {f.contact_email}
                        </a>
                      </dd>
                    </div>
                  </div>
                ) : null}
                {f.website_url ? (
                  <div className="flex gap-3">
                    <Globe className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <div className="min-w-0">
                      <dt className="text-sm font-semibold">Website</dt>
                      <dd className="mt-0.5 text-sm">
                        <a
                          href={f.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-primary hover:underline"
                        >
                          {f.website_url}
                        </a>
                      </dd>
                    </div>
                  </div>
                ) : null}
                {f.map_url ? (
                  <div className="flex gap-3">
                    <ExternalLink className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <div>
                      <dt className="text-sm font-semibold">Directions</dt>
                      <dd className="mt-0.5 text-sm">
                        <a
                          href={f.map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Open in maps
                        </a>
                      </dd>
                    </div>
                  </div>
                ) : null}
                {addressParts.length === 0 &&
                !f.phone &&
                !f.contact_email &&
                !f.website_url &&
                !f.map_url ? (
                  <p className="text-sm text-muted-foreground">
                    The home has not published contact details yet.
                  </p>
                ) : null}
              </dl>
            </section>
          </div>

          {/* Reviews + honesty note */}
          <div className="space-y-6">
            <section id="reviews" className="surface-card animate-rise p-6">
              <h2 className="font-display text-lg font-semibold">External reviews</h2>
              {reviewLinks.length > 0 ? (
                <>
                  <ul className="mt-4 space-y-3">
                    {reviewLinks.map((link) => (
                      <li key={link.url}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                          <ExternalLink className="size-4 shrink-0" aria-hidden />
                          <span className="break-all">{link.label ?? hostnameOf(link.url)}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                    These links open third-party sites. SAHAYAK does not host ratings or reviews.
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  The home has not shared any external review links yet.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-primary/25 bg-primary-soft/50 p-6">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="size-5 text-primary" aria-hidden />
                Verified listing
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                This listing was checked and published by the care team. Details come directly from
                the home's administrator.
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
