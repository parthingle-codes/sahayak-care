import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Donation = Tables<"donations">;
export type DonationType = Donation["donation_type"];
export type DonationStatus = Donation["status"];

export const donationTypeLabels: Record<DonationType, string> = {
  food: "Food",
  clothing: "Clothing",
  essentials: "Essentials & supplies",
  financial: "Financial support",
  volunteering: "Volunteering",
  other: "Other",
};

/** Public: anyone can offer help through the donation form. */
export function useSubmitDonation() {
  return useMutation({
    mutationFn: async (values: TablesInsert<"donations">) => {
      const { data, error } = await supabase
        .from("donations")
        .insert(values)
        .select("reference")
        .single();
      if (error) throw error;
      return data;
    },
  });
}

/** Staff: every donation offer, newest first. */
export function useDonations() {
  return useQuery({
    queryKey: ["donations"],
    queryFn: async (): Promise<Donation[]> => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Staff: update details, add an internal note or move the offer along. */
export function useUpdateDonation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: TablesUpdate<"donations"> }) => {
      const { error } = await supabase.from("donations").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["donations"] }),
  });
}

/** Staff: accept, mark received or decline an offer. */
export function useReviewDonation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      note,
    }: {
      id: string;
      status: DonationStatus;
      note?: string;
    }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("donations")
        .update({
          status,
          staff_note: note?.trim() ? note.trim() : null,
          reviewed_by: auth.user?.id ?? null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["donations"] }),
  });
}
