export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      beds: {
        Row: {
          bed_number: string
          created_at: string
          id: string
          room_id: string
          status: Database["public"]["Enums"]["bed_status"]
          updated_at: string
        }
        Insert: {
          bed_number: string
          created_at?: string
          id?: string
          room_id: string
          status?: Database["public"]["Enums"]["bed_status"]
          updated_at?: string
        }
        Update: {
          bed_number?: string
          created_at?: string
          id?: string
          room_id?: string
          status?: Database["public"]["Enums"]["bed_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "beds_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      care_settings: {
        Row: {
          created_at: string
          id: boolean
          observation_interval_days: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: boolean
          observation_interval_days?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: boolean
          observation_interval_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      health_observations: {
        Row: {
          blood_sugar: number | null
          bp_diastolic: number | null
          bp_systolic: number | null
          created_at: string
          id: string
          note: string | null
          pulse: number | null
          recorded_at: string
          recorded_by: string | null
          resident_id: string
          temperature_c: number | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          blood_sugar?: number | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          created_at?: string
          id?: string
          note?: string | null
          pulse?: number | null
          recorded_at?: string
          recorded_by?: string | null
          resident_id: string
          temperature_c?: number | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          blood_sugar?: number | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          created_at?: string
          id?: string
          note?: string | null
          pulse?: number | null
          recorded_at?: string
          recorded_by?: string | null
          resident_id?: string
          temperature_c?: number | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_observations_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_appointments: {
        Row: {
          created_at: string
          doctor_name: string | null
          id: string
          next_due_on: string | null
          notes: string | null
          reason: string | null
          recorded_by: string | null
          resident_id: string
          scheduled_on: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_name?: string | null
          id?: string
          next_due_on?: string | null
          notes?: string | null
          reason?: string | null
          recorded_by?: string | null
          resident_id: string
          scheduled_on?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_name?: string | null
          id?: string
          next_due_on?: string | null
          notes?: string | null
          reason?: string | null
          recorded_by?: string | null
          resident_id?: string
          scheduled_on?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_appointments_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_conditions: {
        Row: {
          condition: string
          created_at: string
          diagnosed_on: string | null
          id: string
          notes: string | null
          recorded_by: string | null
          resident_id: string
          updated_at: string
        }
        Insert: {
          condition: string
          created_at?: string
          diagnosed_on?: string | null
          id?: string
          notes?: string | null
          recorded_by?: string | null
          resident_id: string
          updated_at?: string
        }
        Update: {
          condition?: string
          created_at?: string
          diagnosed_on?: string | null
          id?: string
          notes?: string | null
          recorded_by?: string | null
          resident_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_conditions_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      medicine_administrations: {
        Row: {
          administered_at: string | null
          created_at: string
          id: string
          medicine_id: string
          notes: string | null
          recorded_by: string | null
          resident_id: string
          scheduled_at: string
          status: Database["public"]["Enums"]["dose_status"]
          updated_at: string
        }
        Insert: {
          administered_at?: string | null
          created_at?: string
          id?: string
          medicine_id: string
          notes?: string | null
          recorded_by?: string | null
          resident_id: string
          scheduled_at?: string
          status?: Database["public"]["Enums"]["dose_status"]
          updated_at?: string
        }
        Update: {
          administered_at?: string | null
          created_at?: string
          id?: string
          medicine_id?: string
          notes?: string | null
          recorded_by?: string | null
          resident_id?: string
          scheduled_at?: string
          status?: Database["public"]["Enums"]["dose_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicine_administrations_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicine_administrations_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      medicines: {
        Row: {
          created_at: string
          created_by: string | null
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          instructions: string | null
          medicine_name: string
          resident_id: string
          scheduled_times: string[]
          start_date: string
          status: Database["public"]["Enums"]["medicine_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          medicine_name: string
          resident_id: string
          scheduled_times?: string[]
          start_date?: string
          status?: Database["public"]["Enums"]["medicine_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          medicine_name?: string
          resident_id?: string
          scheduled_times?: string[]
          start_date?: string
          status?: Database["public"]["Enums"]["medicine_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicines_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resident_bed_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          bed_id: string
          created_at: string
          id: string
          released_at: string | null
          resident_id: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          bed_id: string
          created_at?: string
          id?: string
          released_at?: string | null
          resident_id: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          bed_id?: string
          created_at?: string
          id?: string
          released_at?: string | null
          resident_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resident_bed_assignments_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resident_bed_assignments_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      resident_registrations: {
        Row: {
          contact_address: string | null
          contact_email: string | null
          contact_name: string
          contact_phone: string
          contact_relationship: string | null
          created_at: string
          current_medicines: string | null
          date_of_birth: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          known_conditions: string | null
          mobility: Database["public"]["Enums"]["mobility_level"]
          preferred_admission_date: string | null
          reference: string
          resident_id: string | null
          resident_notes: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["registration_status"]
          updated_at: string
        }
        Insert: {
          contact_address?: string | null
          contact_email?: string | null
          contact_name: string
          contact_phone: string
          contact_relationship?: string | null
          created_at?: string
          current_medicines?: string | null
          date_of_birth?: string | null
          full_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          known_conditions?: string | null
          mobility?: Database["public"]["Enums"]["mobility_level"]
          preferred_admission_date?: string | null
          reference?: string
          resident_id?: string | null
          resident_notes?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
        }
        Update: {
          contact_address?: string | null
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string
          contact_relationship?: string | null
          created_at?: string
          current_medicines?: string | null
          date_of_birth?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          known_conditions?: string | null
          mobility?: Database["public"]["Enums"]["mobility_level"]
          preferred_admission_date?: string | null
          reference?: string
          resident_id?: string | null
          resident_notes?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resident_registrations_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      residents: {
        Row: {
          admission_date: string
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          mobility: Database["public"]["Enums"]["mobility_level"]
          notes: string | null
          room_label: string | null
          status: Database["public"]["Enums"]["resident_status"]
          updated_at: string
        }
        Insert: {
          admission_date?: string
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          full_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          mobility?: Database["public"]["Enums"]["mobility_level"]
          notes?: string | null
          room_label?: string | null
          status?: Database["public"]["Enums"]["resident_status"]
          updated_at?: string
        }
        Update: {
          admission_date?: string
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          mobility?: Database["public"]["Enums"]["mobility_level"]
          notes?: string | null
          room_label?: string | null
          status?: Database["public"]["Enums"]["resident_status"]
          updated_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          capacity: number
          created_at: string
          id: string
          room_number: string
          room_type: string
          status: Database["public"]["Enums"]["room_status"]
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          id?: string
          room_number: string
          room_type?: string
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          room_number?: string
          room_type?: string
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_registration: { Args: { _id: string }; Returns: string }
      ensure_staff_account: {
        Args: { _full_name?: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      list_staff: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }[]
      }
      set_staff_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role: "admin" | "caregiver"
      appointment_status: "upcoming" | "completed" | "missed"
      bed_status: "available" | "occupied" | "maintenance"
      dose_status: "pending" | "given" | "missed"
      gender_type: "male" | "female" | "other"
      medicine_status: "active" | "paused" | "stopped"
      mobility_level: "independent" | "walker" | "wheelchair" | "bedridden"
      registration_status: "pending" | "approved" | "rejected"
      resident_status: "active" | "discharged" | "deceased"
      room_status: "available" | "full" | "maintenance"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "caregiver"],
      appointment_status: ["upcoming", "completed", "missed"],
      bed_status: ["available", "occupied", "maintenance"],
      dose_status: ["pending", "given", "missed"],
      gender_type: ["male", "female", "other"],
      medicine_status: ["active", "paused", "stopped"],
      mobility_level: ["independent", "walker", "wheelchair", "bedridden"],
      registration_status: ["pending", "approved", "rejected"],
      resident_status: ["active", "discharged", "deceased"],
      room_status: ["available", "full", "maintenance"],
    },
  },
} as const
