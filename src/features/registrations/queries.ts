import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Registration = Tables<"resident_registrations">;

/** Public: submit an online admission request. Anyone with the link can do this. */
export function useSubmitRegistration() {
  return useMutation({
    mutationFn: async (values: TablesInsert<"resident_registrations">) => {
      // Public visitors cannot read rows back, so the reference is made here.
      const reference = `REG-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      const { error } = await supabase
        .from("resident_registrations")
        .insert({ ...values, reference });
      if (error) throw error;
      return { reference };
    },
  });
}

/** Staff: every registration request, newest first. */
export function useRegistrations() {
  return useQuery({
    queryKey: ["resident_registrations"],
    queryFn: async (): Promise<Registration[]> => {
      const { data, error } = await supabase
        .from("resident_registrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Staff: fix details on a request before approving it. */
export function useUpdateRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: TablesUpdate<"resident_registrations">;
    }) => {
      const { error } = await supabase.from("resident_registrations").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["resident_registrations"] }),
  });
}

/** Staff: turn a request into a resident record in one step. */
export function useApproveRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc("approve_registration", { _id: id });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["resident_registrations"] });
      void qc.invalidateQueries({ queryKey: ["residents"] });
    },
  });
}

/**
 * Staff: simulate the DigiLocker demo flow for a pending registration.
 *
 * DEMO MODE ONLY — this does NOT perform real Aadhaar or DigiLocker
 * verification.  It records only that a staff member ran the demo simulation.
 * The value written ('demo_completed') is deliberately distinct from any real
 * verification status.  Security is enforced entirely by the existing
 * "Staff only update guard" RLS policy from migration 0005; a non-staff user
 * cannot reach this code path or bypass the policy through the Supabase client.
 */
export function useSimulateDemoVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("resident_registrations")
        .update({ digilocker_status: "demo_completed" })
        .eq("id", id)
        .eq("digilocker_status", "unverified"); // idempotency guard: skip if already set
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["resident_registrations"] }),
  });
}

/** Staff: decline a request, with an optional reason. */
export function useRejectRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("resident_registrations")
        .update({
          status: "rejected",
          review_note: note || null,
          reviewed_by: auth.user?.id ?? null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["resident_registrations"] }),
  });
}
