import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Resident = Tables<"residents">;
export type Observation = Tables<"health_observations">;
export type Condition = Tables<"medical_conditions">;

/** Residents, newest admissions first. Used by every record form's picker. */
export function useResidents() {
  return useQuery({
    queryKey: ["residents"],
    queryFn: async (): Promise<Resident[]> => {
      const { data, error } = await supabase
        .from("residents")
        .select("*")
        .order("full_name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateResident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: TablesInsert<"residents">) => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("residents")
        .insert({ ...values, created_by: auth.user?.id ?? null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["residents"] }),
  });
}

export function useObservations() {
  return useQuery({
    queryKey: ["health_observations"],
    queryFn: async (): Promise<Observation[]> => {
      const { data, error } = await supabase
        .from("health_observations")
        .select("*")
        .order("recorded_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateObservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Omit<TablesInsert<"health_observations">, "recorded_by">) => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("health_observations")
        .insert({ ...values, recorded_by: auth.user?.id ?? null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["health_observations"] }),
  });
}

export function useConditions() {
  return useQuery({
    queryKey: ["medical_conditions"],
    queryFn: async (): Promise<Condition[]> => {
      const { data, error } = await supabase
        .from("medical_conditions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateCondition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Omit<TablesInsert<"medical_conditions">, "recorded_by">) => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("medical_conditions")
        .insert({ ...values, recorded_by: auth.user?.id ?? null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["medical_conditions"] }),
  });
}
