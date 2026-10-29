import { useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  facilityErrorMessage,
  useCreateFacility,
  useUpdateFacility,
  type FacilityContent,
  type FacilityWithAudit,
} from "@/features/directory/queries";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_PATTERN = /^https?:\/\//i;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

type LinkRow = { label: string; url: string };

/**
 * Create or edit a facility listing. Only content columns are ever sent —
 * `status` changes happen through the explicit publish action and
 * `verification` only through set_facility_verification (the database
 * enforces both, the form simply never offers them here).
 */
export function FacilityFormDialog({
  facility,
  open,
  onOpenChange,
}: {
  facility?: FacilityWithAudit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = Boolean(facility);
  const create = useCreateFacility();
  const update = useUpdateFacility();
  const pending = create.isPending || update.isPending;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(facility?.name ?? "");
    setSlug(facility?.slug ?? "");
    setSlugTouched(Boolean(facility));
    setSummary(facility?.summary ?? "");
    setDescription(facility?.description ?? "");
    setAddressLine(facility?.address_line ?? "");
    setCity(facility?.city ?? "");
    setState(facility?.state ?? "");
    setPostalCode(facility?.postal_code ?? "");
    setCountry(facility?.country ?? "India");
    setPhone(facility?.phone ?? "");
    setEmail(facility?.contact_email ?? "");
    setWebsite(facility?.website_url ?? "");
    setMapUrl(facility?.map_url ?? "");
    const existing =
      Array.isArray(facility?.review_links) && facility
        ? (facility.review_links as unknown[]).flatMap((item) => {
            if (typeof item !== "object" || item === null) return [];
            const url = (item as Record<string, unknown>)["url"];
            const label = (item as Record<string, unknown>)["label"];
            return [
              {
                url: typeof url === "string" ? url : "",
                label: typeof label === "string" ? label : "",
              },
            ];
          })
        : [];
    setLinks(existing);
    setFormError(null);
  }, [open, facility]);

  const validate = (): string | null => {
    if (name.trim().length < 2) return "Enter the home's name.";
    if (!SLUG_PATTERN.test(slug.trim()))
      return "Web address (slug) must contain lowercase letters, numbers and hyphens only.";
    if (website.trim() && !URL_PATTERN.test(website.trim()))
      return "Website must start with http:// or https://";
    if (mapUrl.trim() && !URL_PATTERN.test(mapUrl.trim()))
      return "Map link must start with http:// or https://";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return "Enter a valid email address, or leave it blank.";
    if (links.some((l) => l.url.trim() && !URL_PATTERN.test(l.url.trim())))
      return "Review links must start with http:// or https://";
    return null;
  };

  const submit = async () => {
    const error = validate();
    if (error) {
      setFormError(error);
      return;
    }
    setFormError(null);
    const content: FacilityContent = {
      name: name.trim(),
      slug: slug.trim(),
      summary: summary.trim() || null,
      description: description.trim() || null,
      address_line: addressLine.trim() || null,
      city: city.trim() || null,
      state: state.trim() || null,
      postal_code: postalCode.trim() || null,
      country: country.trim() || "India",
      phone: phone.trim() || null,
      contact_email: email.trim() || null,
      website_url: website.trim() || null,
      map_url: mapUrl.trim() || null,
      review_links: links
        .filter((l) => l.url.trim())
        .map((l) => ({
          url: l.url.trim(),
          ...(l.label.trim() ? { label: l.label.trim() } : {}),
        })),
    };
    try {
      if (facility) {
        await update.mutateAsync({ id: facility.id, values: content });
        toast.success("Listing updated.");
      } else {
        await create.mutateAsync(content);
        toast.success("Listing created as a draft. Verify and publish it to make it public.");
      }
      onOpenChange(false);
    } catch (e) {
      toast.error(facilityErrorMessage(e));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{facility ? "Edit listing" : "Add a care home"}</DialogTitle>
          <DialogDescription>
            {facility
              ? "Update the public details of this listing. Publishing and verification are separate steps."
              : "New listings start as a private draft — verify and publish them when the details are confirmed."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="fac-name">Name *</Label>
              <Input
                id="fac-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                placeholder="Sunrise Old Age Home"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fac-slug">Web address (slug) *</Label>
              <Input
                id="fac-slug"
                value={slug}
                disabled={isEdit}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="sunrise-old-age-home"
              />
              {!isEdit ? (
                <p className="text-xs text-muted-foreground">sahayak.app/homes/{slug || "…"}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  The web address cannot change after creation.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fac-summary">Short description</Label>
            <Input
              id="fac-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="One or two lines shown on cards and in search results"
              maxLength={300}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fac-description">Full description &amp; services</Label>
            <Textarea
              id="fac-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="About the home, facilities, services offered, visiting hours…"
              rows={5}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fac-address">Address line</Label>
            <Input
              id="fac-address"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="12, MG Road, near City Hospital"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="fac-city">City</Label>
              <Input id="fac-city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fac-state">State</Label>
              <Input id="fac-state" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fac-postal">PIN code</Label>
              <Input
                id="fac-postal"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="fac-country">Country</Label>
              <Input
                id="fac-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fac-phone">Phone</Label>
              <Input
                id="fac-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="fac-email">Contact email</Label>
              <Input
                id="fac-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@sunrisehome.org"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fac-website">Official website</Label>
              <Input
                id="fac-website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://sunrisehome.org"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fac-map">Map / directions link</Label>
            <Input
              id="fac-map"
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              placeholder="Paste a Google Maps share link"
            />
            <p className="text-xs text-muted-foreground">
              Share link from Google Maps — visitors use it for directions.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>External review links</Label>
            {links.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={row.url}
                  onChange={(e) =>
                    setLinks(links.map((l, j) => (j === i ? { ...l, url: e.target.value } : l)))
                  }
                  placeholder="https://maps.google.com/… (review page)"
                  aria-label={`Review link ${i + 1} URL`}
                  className="flex-1"
                />
                <Input
                  value={row.label}
                  onChange={(e) =>
                    setLinks(links.map((l, j) => (j === i ? { ...l, label: e.target.value } : l)))
                  }
                  placeholder="Label (optional)"
                  aria-label={`Review link ${i + 1} label`}
                  className="w-36"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove review link ${i + 1}`}
                  onClick={() => setLinks(links.filter((_, j) => j !== i))}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="justify-self-start"
              onClick={() => setLinks([...links, { url: "", label: "" }])}
            >
              <Plus className="size-4" aria-hidden /> Add review link
            </Button>
            <p className="text-xs text-muted-foreground">
              Link to genuine third-party pages only (Google Maps reviews, directories, news
              articles). Leave empty if none exist — SAHAYAK never hosts ratings.
            </p>
          </div>

          {formError ? <p className="text-sm font-medium text-alert">{formError}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {pending ? "Saving…" : facility ? "Save changes" : "Create draft listing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
