import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Registration = Tables<"resident_registrations">;

/** Public: submit an online admission request. Anyone with the link can do this. */
export function useSubmitRegistration() {
  return useMutation({
    mutationFn: async (values: TablesInsert<"resident_registrations">) => {
      const { data, error } = await supabase
        .from("resident_registrations")
        .insert(values)
        .select("reference")
        .single();
      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from("resident_registrations")
        .update(values)
        .eq("id", id);
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
