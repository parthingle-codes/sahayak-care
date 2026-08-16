import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import type { Role } from "@/lib/navigation";

export type Resident = Tables<"residents">;
export type Observation = Tables<"health_observations">;
export type Condition = Tables<"medical_conditions">;

export type StaffMember = {
  user_id: string;
  email: string;
  full_name: string;
  role: Role | null;
  created_at: string;
};

/** Admin-only staff directory with each account's role. */
export function useStaff(enabled: boolean) {
  return useQuery({
    queryKey: ["staff"],
    enabled,
    queryFn: async (): Promise<StaffMember[]> => {
      const { data, error } = await supabase.rpc("list_staff");
      if (error) throw error;
      return (data ?? []) as StaffMember[];
    },
  });
}

/** Admin-only: promote to admin or move back to caregiver. */
export function useSetStaffRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) => {
      const { error } = await supabase.rpc("set_staff_role", {
        _user_id: userId,
        _role: role,
      });
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}


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

/** Edit an existing resident so mistakes can be corrected later. */
export function useUpdateResident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: TablesUpdate<"residents"> }) => {
      const { data, error } = await supabase
        .from("residents")
        .update(values)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["residents"] }),
  });
}

/** Edit a recorded set of vitals. */
export function useUpdateObservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: TablesUpdate<"health_observations">;
    }) => {
      const { data, error } = await supabase
        .from("health_observations")
        .update(values)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["health_observations"] }),
  });
}

/** Edit a recorded medical condition. */
export function useUpdateCondition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: TablesUpdate<"medical_conditions">;
    }) => {
      const { data, error } = await supabase
        .from("medical_conditions")
        .update(values)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["medical_conditions"] }),
  });
}

export type Appointment = Tables<"medical_appointments">;
export type CareSettings = Tables<"care_settings">;

/**
 * Facility-wide care settings. Holds the medical observation cycle length,
 * so the 14-day rhythm is data, not a hard-coded rule.
 */
export function useCareSettings() {
  return useQuery({
    queryKey: ["care_settings"],
    queryFn: async (): Promise<CareSettings | null> => {
      const { data, error } = await supabase.from("care_settings").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/** Admin-only: change the observation cycle length. */
export function useUpdateCareSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (days: number) => {
      const { error } = await supabase
        .from("care_settings")
        .update({ observation_interval_days: days })
        .eq("id", true);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["care_settings"] }),
  });
}

/** Medical appointments / observations, soonest first. */
export function useAppointments() {
  return useQuery({
    queryKey: ["medical_appointments"],
    queryFn: async (): Promise<Appointment[]> => {
      const { data, error } = await supabase
        .from("medical_appointments")
        .select("*")
        .order("scheduled_on", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Omit<TablesInsert<"medical_appointments">, "recorded_by">) => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("medical_appointments")
        .insert({ ...values, recorded_by: auth.user?.id ?? null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["medical_appointments"] }),
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: TablesUpdate<"medical_appointments">;
    }) => {
      const { data, error } = await supabase
        .from("medical_appointments")
        .update(values)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["medical_appointments"] }),
  });
}
