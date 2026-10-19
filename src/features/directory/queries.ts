import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Facility = Tables<"facilities">;
export type FacilityAudit = Tables<"facility_audit">;
export type FacilityStatus = Facility["status"];
export type VerificationStatus = Facility["verification"];

/** One external review link as entered by the admin (label optional). */
export type ReviewLink = { label?: string; url: string };

/** Admin-edited content columns. id/status/verification/timestamps are never sent from forms. */
export type FacilityContent = Pick<
  Facility,
  | "slug"
  | "name"
  | "summary"
  | "description"
  | "address_line"
  | "city"
  | "state"
  | "postal_code"
  | "country"
  | "phone"
  | "contact_email"
  | "website_url"
  | "map_url"
  | "review_links"
>;

/**
 * `review_links` is jsonb — never trust its shape. Keep only objects with a
 * non-empty http(s) url and an optional string label.
 */
export function parseReviewLinks(value: unknown): ReviewLink[] {
  if (!Array.isArray(value)) return [];
  const links: ReviewLink[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) continue;
    const url = (item as Record<string, unknown>)["url"];
    if (typeof url !== "string" || !/^https?:\/\//i.test(url.trim())) continue;
    const label = (item as Record<string, unknown>)["label"];
    links.push({
      url: url.trim(),
      ...(typeof label === "string" && label.trim() ? { label: label.trim() } : {}),
    });
  }
  return links;
}

/** Human-readable "City, State" (or best available part) for a listing. */
export function facilityLocation(f: Pick<Facility, "city" | "state" | "country">): string {
  const parts = [f.city, f.state].filter(Boolean);
  return parts.length ? parts.join(", ") : f.country;
}

/** Friendly error copy for the codes the directory actually produces. */
export function facilityErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  if (code === "23505") return "That web address (slug) is already used by another listing.";
  if (code === "23514")
    return "Unpublish this listing before marking it unverified — a public listing must stay verified.";
  if (code === "42501")
    return "You do not have permission to do that. Administrator access is required.";
  return error instanceof Error && error.message
    ? error.message
    : "Something went wrong. Please try again.";
}

/* ============================================================
 * Public (SSR-safe plain fetchers, used by route loaders)
 * ============================================================ */

/** Public: every published listing, ordered by name. Drafts are excluded by RLS. */
export async function fetchPublishedFacilities(): Promise<Facility[]> {
  const { data, error } = await supabase
    .from("facilities")
    .select("*")
    .eq("status", "published")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Public: one published listing by its slug, or null if missing/draft. */
export async function fetchPublishedFacility(slug: string): Promise<Facility | null> {
  const { data, error } = await supabase
    .from("facilities")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data;
}

/* ============================================================
 * Admin (TanStack Query hooks)
 * ============================================================ */

export type FacilityWithAudit = Facility & { audit: FacilityAudit | null };

/** Admin: all listings (draft + published) with their verification audit row. */
export function useFacilities() {
  return useQuery({
    queryKey: ["facilities"],
    queryFn: async (): Promise<FacilityWithAudit[]> => {
      const [facilities, audit] = await Promise.all([
        supabase.from("facilities").select("*").order("updated_at", { ascending: false }),
        supabase.from("facility_audit").select("*"),
      ]);
      if (facilities.error) throw facilities.error;
      if (audit.error) throw audit.error;
      const auditById = new Map((audit.data ?? []).map((a) => [a.facility_id, a]));
      return (facilities.data ?? []).map((f) => ({ ...f, audit: auditById.get(f.id) ?? null }));
    },
  });
}

/** Admin: create a listing. Defaults apply — it starts draft & unverified. */
export function useCreateFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: FacilityContent) => {
      const { error } = await supabase.from("facilities").insert(values);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["facilities"] }),
  });
}

/** Admin: edit content columns (and publish/unpublish via `status`). */
export function useUpdateFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: Partial<FacilityContent> & { status?: FacilityStatus };
    }) => {
      const { error } = await supabase.from("facilities").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["facilities"] }),
  });
}

/** Admin: the only path that changes `verification` — writes audit evidence too. */
export function useSetFacilityVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      verification,
      note = "",
    }: {
      id: string;
      verification: VerificationStatus;
      note?: string;
    }) => {
      const { error } = await supabase.rpc("set_facility_verification", {
        _facility_id: id,
        _verification: verification,
        _note: note,
      });
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["facilities"] }),
  });
}

/** Admin: remove a listing. The audit row cascades away with it. */
export function useDeleteFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("facilities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["facilities"] }),
  });
}
