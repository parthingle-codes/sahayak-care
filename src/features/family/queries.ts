import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type FamilyLink = Tables<"family_access">;
export type FamilyResident = Tables<"residents">;
export type FamilyObservation = Tables<"health_observations">;
export type FamilyAppointment = Tables<"medical_appointments">;

/**
 * Family portal data. Row-level security already scopes every table to the
 * residents linked to the signed-in family account, so plain selects are safe.
 */
export function useFamilyResidents(enabled: boolean) {
  return useQuery({
    queryKey: ["family", "residents"],
    enabled,
    queryFn: async (): Promise<FamilyResident[]> => {
      const { data, error } = await supabase
        .from("residents")
        .select("*")
        .order("full_name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useFamilyObservations(enabled: boolean) {
  return useQuery({
    queryKey: ["family", "observations"],
    enabled,
    queryFn: async (): Promise<FamilyObservation[]> => {
      const { data, error } = await supabase
        .from("health_observations")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useFamilyAppointments(enabled: boolean) {
  return useQuery({
    queryKey: ["family", "appointments"],
    enabled,
    queryFn: async (): Promise<FamilyAppointment[]> => {
      const { data, error } = await supabase
        .from("medical_appointments")
        .select("*")
        .order("scheduled_on", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Staff: family accounts linked to one resident. */
export function useFamilyLinks(residentId: string) {
  return useQuery({
    queryKey: ["family", "links", residentId],
    queryFn: async (): Promise<FamilyLink[]> => {
      const { data, error } = await supabase
        .from("family_access")
        .select("*")
        .eq("resident_id", residentId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

const emailSchema = z.string().trim().email().max(255);

/** Staff: link a family account to a resident by their sign-in email. */
export function useLinkFamily(residentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      const parsed = emailSchema.parse(email);
      const { error } = await supabase.rpc("link_family_by_email", {
        _email: parsed,
        _resident_id: residentId,
      });
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["family", "links", residentId] }),
  });
}

/** Staff: remove a family account's access to a resident. */
export function useUnlinkFamily(residentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase.from("family_access").delete().eq("id", linkId);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["family", "links", residentId] }),
  });
}
