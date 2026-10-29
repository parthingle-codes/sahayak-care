-- ============================================================================
-- SAHAAYAK -- full schema restoration for a NEW, EMPTY Supabase project.
-- Reconstructs the original application schema, grants, triggers and RLS
-- policies exactly as recorded in this repository, in original order:
--
--   BLOCK 1 : supabase/migrations (8 legacy files, chronological order)
--             + drizzle/migrations/0000_create_resident_registrations.sql
--             + drizzle/migrations/0001_create_donations.sql
--   BLOCK 2 : drizzle/migrations/0002_add_family_role.sql
--   BLOCK 3 : drizzle/migrations/0003_family_portal.sql
--             + drizzle/migrations/0004_ensure_family_account.sql
--             + drizzle/migrations/0005_staff_only_guard.sql
--
-- EXCLUDED ON PURPOSE:
--   * drizzle/migrations/0006_create_facility_directory.sql (facility
--     directory -- apply it separately later; no application code calls it yet)
--   * All user and operational data (auth.users, residents, registrations,
--     donations, profiles, ...): this repository does not store it, so it
--     cannot be restored from here. Migration-history seed rows ARE included:
--     the single care_settings row and the 4 starter rooms with their beds.
--   * Project/Auth dashboard settings (sign-up, email, providers, redirect
--     URLs): not SQL; configure them in the Supabase dashboard.
--
-- TRANSACTION MAP (the boundary after 0002 is REQUIRED):
--   PostgreSQL forbids using an enum value that was added inside the same
--   transaction. Migration 0003 creates three policies that reference
--   'family', so 0002 must COMMIT first. Hence exactly three blocks.
--
-- HOW TO APPLY:
--   Supabase Dashboard -> SQL Editor -> paste this ENTIRE file -> Run.
--   Paste it whole: the 0005 DO-block contains semicolons that must not be
--   split apart manually.
--   On partial failure the failing block rolls back while earlier blocks
--   remain committed. Fix the cause, then re-run ONLY the failed block (use
--   the BLOCK markers below), or drop the created objects and start over.
--   Never re-run a block that already succeeded: CREATE TYPE/TABLE will
--   error with 'already exists'.
--
-- Assembled VERBATIM from the 14 source files above: nothing was edited,
-- dropped, reordered across block boundaries, or invented. Read-only
-- verification queries with expected values follow the final COMMIT.
-- ============================================================================
-- BEGIN BLOCK 1: base schema (8 legacy supabase files + drizzle 0000 + 0001)
BEGIN;

-- ------------------------------------------------------------------------
-- SOURCE: supabase\migrations\20260813014332_c87e01d7-5ace-4f73-954a-8546acdad1db.sql (verbatim)
-- ------------------------------------------------------------------------
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'caregiver');

-- Staff profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Roles table (never store roles on profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Role check helper (security definer avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Staff can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Staff can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Roles policies (read only from the app; writes happen through definer functions)
CREATE POLICY "Staff can read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Called by the signed-in user right after sign-up/sign-in. Creates the profile
-- if missing and assigns a role: the very first staff account becomes admin,
-- everyone after that becomes a caregiver.
CREATE OR REPLACE FUNCTION public.ensure_staff_account(_full_name TEXT DEFAULT '')
RETURNS public.app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _role public.app_role;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.profiles (id, full_name)
  VALUES (_uid, COALESCE(NULLIF(trim(_full_name), ''), ''))
  ON CONFLICT (id) DO UPDATE
    SET full_name = CASE
      WHEN public.profiles.full_name = '' THEN COALESCE(NULLIF(trim(EXCLUDED.full_name), ''), '')
      ELSE public.profiles.full_name
    END;

  SELECT role INTO _role FROM public.user_roles WHERE user_id = _uid LIMIT 1;
  IF _role IS NOT NULL THEN
    RETURN _role;
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_roles) THEN
    _role := 'caregiver';
  ELSE
    _role := 'admin';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN _role;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_staff_account(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_staff_account(TEXT) TO authenticated;

-- ------------------------------------------------------------------------
-- SOURCE: supabase\migrations\20260813014356_4056aa3c-3eed-403a-a1f9-a3716b3067b4.sql (verbatim)
-- ------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
REVOKE ALL ON FUNCTION public.ensure_staff_account(TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM anon;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM authenticated;

-- ------------------------------------------------------------------------
-- SOURCE: supabase\migrations\20260814113722_05d9c475-34c6-41e1-8078-7301c14d6aba.sql (verbatim)
-- ------------------------------------------------------------------------
CREATE TYPE public.resident_status AS ENUM ('active','discharged','deceased');
CREATE TYPE public.mobility_level AS ENUM ('independent','walker','wheelchair','bedridden');
CREATE TYPE public.gender_type AS ENUM ('male','female','other');

CREATE TABLE public.residents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  gender public.gender_type,
  date_of_birth date,
  room_label text,
  admission_date date NOT NULL DEFAULT current_date,
  mobility public.mobility_level NOT NULL DEFAULT 'independent',
  status public.resident_status NOT NULL DEFAULT 'active',
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.residents TO authenticated;
GRANT ALL ON public.residents TO service_role;
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read residents" ON public.residents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can add residents" ON public.residents FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update residents" ON public.residents FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete residents" ON public.residents FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.health_observations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  bp_systolic smallint,
  bp_diastolic smallint,
  pulse smallint,
  temperature_c numeric(4,1),
  blood_sugar numeric(5,1),
  weight_kg numeric(5,1),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_observations TO authenticated;
GRANT ALL ON public.health_observations TO service_role;
ALTER TABLE public.health_observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read observations" ON public.health_observations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can add observations" ON public.health_observations FOR INSERT TO authenticated WITH CHECK (auth.uid() = recorded_by);
CREATE POLICY "Staff can update own observations" ON public.health_observations FOR UPDATE TO authenticated USING (auth.uid() = recorded_by OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = recorded_by OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete observations" ON public.health_observations FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.medical_conditions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  condition text NOT NULL,
  diagnosed_on date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_conditions TO authenticated;
GRANT ALL ON public.medical_conditions TO service_role;
ALTER TABLE public.medical_conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read conditions" ON public.medical_conditions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can add conditions" ON public.medical_conditions FOR INSERT TO authenticated WITH CHECK (auth.uid() = recorded_by);
CREATE POLICY "Staff can update own conditions" ON public.medical_conditions FOR UPDATE TO authenticated USING (auth.uid() = recorded_by OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = recorded_by OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete conditions" ON public.medical_conditions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_observations_resident ON public.health_observations(resident_id, recorded_at DESC);
CREATE INDEX idx_conditions_resident ON public.medical_conditions(resident_id);

CREATE TRIGGER residents_set_updated_at BEFORE UPDATE ON public.residents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER observations_set_updated_at BEFORE UPDATE ON public.health_observations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER conditions_set_updated_at BEFORE UPDATE ON public.medical_conditions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------------------
-- SOURCE: supabase\migrations\20260815091932_85a2665e-fb93-44ef-8380-3e4ecd38bd2f.sql (verbatim)
-- ------------------------------------------------------------------------
-- Residents: caregivers can add and edit too
DROP POLICY IF EXISTS "Admins can add residents" ON public.residents;
DROP POLICY IF EXISTS "Admins can update residents" ON public.residents;

CREATE POLICY "Staff can add residents"
  ON public.residents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can update residents"
  ON public.residents FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admin staff directory
CREATE OR REPLACE FUNCTION public.list_staff()
RETURNS TABLE (user_id uuid, email text, full_name text, role public.app_role, created_at timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only administrators can view staff accounts';
  END IF;

  RETURN QUERY
  SELECT u.id,
         u.email::text,
         COALESCE(p.full_name, ''),
         r.role,
         u.created_at
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  LEFT JOIN public.user_roles r ON r.user_id = u.id
  ORDER BY u.created_at ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.list_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_staff() TO authenticated;

-- Admin role assignment
CREATE OR REPLACE FUNCTION public.set_staff_role(_user_id uuid, _role public.app_role)
RETURNS public.app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only administrators can change roles';
  END IF;

  IF _user_id = auth.uid() AND _role <> 'admin' THEN
    RAISE EXCEPTION 'You cannot remove your own administrator access';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = _user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role);

  RETURN _role;
END;
$$;

REVOKE ALL ON FUNCTION public.set_staff_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_staff_role(uuid, public.app_role) TO authenticated;

-- ------------------------------------------------------------------------
-- SOURCE: supabase\migrations\20260816124435_ce385e3d-cf08-4c45-a65b-f4fec4f73ce5.sql (verbatim)
-- ------------------------------------------------------------------------
CREATE TYPE public.appointment_status AS ENUM ('upcoming', 'completed', 'missed');

CREATE TABLE public.medical_appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  scheduled_on DATE NOT NULL DEFAULT CURRENT_DATE,
  next_due_on DATE,
  doctor_name TEXT,
  reason TEXT,
  notes TEXT,
  status public.appointment_status NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX medical_appointments_resident_idx ON public.medical_appointments (resident_id);
CREATE INDEX medical_appointments_scheduled_idx ON public.medical_appointments (scheduled_on);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_appointments TO authenticated;
GRANT ALL ON public.medical_appointments TO service_role;

ALTER TABLE public.medical_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read appointments" ON public.medical_appointments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can add appointments" ON public.medical_appointments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can update appointments" ON public.medical_appointments
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete appointments" ON public.medical_appointments
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER appointments_set_updated_at
  BEFORE UPDATE ON public.medical_appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.care_settings (
  id BOOLEAN NOT NULL DEFAULT true PRIMARY KEY CHECK (id),
  observation_interval_days SMALLINT NOT NULL DEFAULT 14 CHECK (observation_interval_days BETWEEN 1 AND 365),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.care_settings TO authenticated;
GRANT INSERT, UPDATE ON public.care_settings TO authenticated;
GRANT ALL ON public.care_settings TO service_role;

ALTER TABLE public.care_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read care settings" ON public.care_settings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert care settings" ON public.care_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update care settings" ON public.care_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER care_settings_set_updated_at
  BEFORE UPDATE ON public.care_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.care_settings (id, observation_interval_days) VALUES (true, 14);

-- ------------------------------------------------------------------------
-- SOURCE: supabase\migrations\20260820125535_ddab3200-1af3-4f86-8251-87ae9bcc87cb.sql (verbatim)
-- ------------------------------------------------------------------------
-- ROOMS
CREATE TYPE public.room_status AS ENUM ('available', 'full', 'maintenance');
CREATE TYPE public.bed_status AS ENUM ('available', 'occupied', 'maintenance');
CREATE TYPE public.medicine_status AS ENUM ('active', 'paused', 'stopped');
CREATE TYPE public.dose_status AS ENUM ('pending', 'given', 'missed');

CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number TEXT NOT NULL UNIQUE,
  room_type TEXT NOT NULL DEFAULT 'shared',
  capacity SMALLINT NOT NULL DEFAULT 2 CHECK (capacity > 0 AND capacity <= 20),
  status public.room_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read rooms" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage rooms insert" ON public.rooms FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage rooms update" ON public.rooms FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage rooms delete" ON public.rooms FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER rooms_set_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- BEDS
CREATE TABLE public.beds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  bed_number TEXT NOT NULL,
  status public.bed_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, bed_number)
);
CREATE INDEX beds_room_id_idx ON public.beds(room_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.beds TO authenticated;
GRANT ALL ON public.beds TO service_role;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read beds" ON public.beds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage beds insert" ON public.beds FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage beds update" ON public.beds FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage beds delete" ON public.beds FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER beds_set_updated_at BEFORE UPDATE ON public.beds FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- BED ASSIGNMENTS
CREATE TABLE public.resident_bed_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  bed_id UUID NOT NULL REFERENCES public.beds(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  released_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- one active resident per bed, and one active bed per resident
CREATE UNIQUE INDEX bed_single_active_occupant ON public.resident_bed_assignments(bed_id) WHERE released_at IS NULL;
CREATE UNIQUE INDEX resident_single_active_bed ON public.resident_bed_assignments(resident_id) WHERE released_at IS NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resident_bed_assignments TO authenticated;
GRANT ALL ON public.resident_bed_assignments TO service_role;
ALTER TABLE public.resident_bed_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read assignments" ON public.resident_bed_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can add assignments" ON public.resident_bed_assignments FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can update assignments" ON public.resident_bed_assignments FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete assignments" ON public.resident_bed_assignments FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER assignments_set_updated_at BEFORE UPDATE ON public.resident_bed_assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- keep bed.status in step with active occupancy
CREATE OR REPLACE FUNCTION public.sync_bed_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.beds b
  SET status = CASE
    WHEN EXISTS (SELECT 1 FROM public.resident_bed_assignments a WHERE a.bed_id = b.id AND a.released_at IS NULL)
      THEN 'occupied'::public.bed_status
    ELSE 'available'::public.bed_status
  END
  WHERE b.id IN (COALESCE(NEW.bed_id, OLD.bed_id), COALESCE(OLD.bed_id, NEW.bed_id))
    AND b.status <> 'maintenance';
  RETURN NULL;
END;
$$;
CREATE TRIGGER assignments_sync_bed_status
AFTER INSERT OR UPDATE OR DELETE ON public.resident_bed_assignments
FOR EACH ROW EXECUTE FUNCTION public.sync_bed_status();

-- MEDICINES
CREATE TABLE public.medicines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  scheduled_times TEXT[] NOT NULL DEFAULT '{}',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  instructions TEXT,
  status public.medicine_status NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX medicines_resident_id_idx ON public.medicines(resident_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medicines TO authenticated;
GRANT ALL ON public.medicines TO service_role;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read medicines" ON public.medicines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can add medicines" ON public.medicines FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can update medicines" ON public.medicines FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete medicines" ON public.medicines FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER medicines_set_updated_at BEFORE UPDATE ON public.medicines FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- MEDICINE ADMINISTRATIONS
CREATE TABLE public.medicine_administrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  administered_at TIMESTAMPTZ,
  status public.dose_status NOT NULL DEFAULT 'pending',
  recorded_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (medicine_id, scheduled_at)
);
CREATE INDEX medicine_admin_resident_idx ON public.medicine_administrations(resident_id, scheduled_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medicine_administrations TO authenticated;
GRANT ALL ON public.medicine_administrations TO service_role;
ALTER TABLE public.medicine_administrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read doses" ON public.medicine_administrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can add doses" ON public.medicine_administrations FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can update doses" ON public.medicine_administrations FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete doses" ON public.medicine_administrations FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER doses_set_updated_at BEFORE UPDATE ON public.medicine_administrations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Starter facility inventory
INSERT INTO public.rooms (room_number, room_type, capacity) VALUES
  ('101', 'shared', 2),
  ('102', 'shared', 2),
  ('103', 'single', 1),
  ('201', 'shared', 3);

INSERT INTO public.beds (room_id, bed_number)
SELECT r.id, r.room_number || '-' || g.n
FROM public.rooms r
CROSS JOIN LATERAL generate_series(1, r.capacity) AS g(n);

-- ------------------------------------------------------------------------
-- SOURCE: supabase\migrations\20260820125604_a2dcec0a-c55d-4093-9e3d-7d6c7d5582c5.sql (verbatim)
-- ------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.sync_bed_status() FROM PUBLIC, anon, authenticated;

-- ------------------------------------------------------------------------
-- SOURCE: supabase\migrations\20260820125626_5a61b130-8def-49ff-8b88-ab37dc54580a.sql (verbatim)
-- ------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.ensure_staff_account(text) FROM anon;
REVOKE ALL ON FUNCTION public.list_staff() FROM anon;
REVOKE ALL ON FUNCTION public.set_staff_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

-- ------------------------------------------------------------------------
-- SOURCE: drizzle\migrations\0000_create_resident_registrations.sql (verbatim)
-- ------------------------------------------------------------------------
CREATE TYPE public.registration_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.resident_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  full_name text NOT NULL,
  gender public.gender_type,
  date_of_birth date,
  mobility public.mobility_level NOT NULL DEFAULT 'independent',
  preferred_admission_date date,
  resident_notes text,
  contact_name text NOT NULL,
  contact_relationship text,
  contact_phone text NOT NULL,
  contact_email text,
  contact_address text,
  known_conditions text,
  current_medicines text,
  status public.registration_status NOT NULL DEFAULT 'pending',
  review_note text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  resident_id uuid REFERENCES public.residents(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX resident_registrations_status_idx ON public.resident_registrations (status, created_at DESC);

GRANT INSERT ON public.resident_registrations TO anon;
GRANT SELECT, INSERT, UPDATE ON public.resident_registrations TO authenticated;
GRANT ALL ON public.resident_registrations TO service_role;

ALTER TABLE public.resident_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a registration"
  ON public.resident_registrations FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND reviewed_by IS NULL AND resident_id IS NULL);

CREATE POLICY "Staff can read registrations"
  ON public.resident_registrations FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can update registrations"
  ON public.resident_registrations FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE TRIGGER registrations_set_updated_at
  BEFORE UPDATE ON public.resident_registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.approve_registration(_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _r public.resident_registrations;
  _resident_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO _r FROM public.resident_registrations WHERE id = _id FOR UPDATE;
  IF _r.id IS NULL THEN
    RAISE EXCEPTION 'Registration not found';
  END IF;
  IF _r.status = 'approved' THEN
    RETURN _r.resident_id;
  END IF;

  INSERT INTO public.residents (full_name, gender, date_of_birth, admission_date, mobility, status, notes, created_by)
  VALUES (
    _r.full_name,
    _r.gender,
    _r.date_of_birth,
    COALESCE(_r.preferred_admission_date, CURRENT_DATE),
    _r.mobility,
    'active',
    NULLIF(concat_ws(E'\n',
      NULLIF(_r.resident_notes, ''),
      CASE WHEN COALESCE(_r.known_conditions, '') <> '' THEN 'Known at intake: ' || _r.known_conditions END,
      CASE WHEN COALESCE(_r.current_medicines, '') <> '' THEN 'Medicines at intake: ' || _r.current_medicines END,
      'Contact: ' || _r.contact_name || COALESCE(' (' || _r.contact_relationship || ')', '') || ' — ' || _r.contact_phone
    ), ''),
    auth.uid()
  )
  RETURNING id INTO _resident_id;

  UPDATE public.resident_registrations
  SET status = 'approved', resident_id = _resident_id, reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = _id;

  RETURN _resident_id;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_registration(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_registration(uuid) TO authenticated;

-- ------------------------------------------------------------------------
-- SOURCE: drizzle\migrations\0001_create_donations.sql (verbatim)
-- ------------------------------------------------------------------------
CREATE TYPE public.donation_type AS ENUM ('food','clothing','essentials','financial','volunteering','other');
CREATE TYPE public.donation_status AS ENUM ('pending','accepted','received','declined');

CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL DEFAULT upper(substr(replace((gen_random_uuid())::text, '-', ''), 1, 8)),
  donation_type public.donation_type NOT NULL DEFAULT 'other',
  description TEXT,
  amount NUMERIC,
  currency TEXT NOT NULL DEFAULT 'INR',
  preferred_date DATE,
  donor_name TEXT NOT NULL,
  donor_phone TEXT NOT NULL,
  donor_email TEXT,
  donor_address TEXT,
  status public.donation_status NOT NULL DEFAULT 'pending',
  staff_note TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.donations TO anon;
GRANT SELECT, INSERT, UPDATE ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can offer a donation"
  ON public.donations FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND reviewed_by IS NULL AND reviewed_at IS NULL);

CREATE POLICY "Staff can read donations"
  ON public.donations FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can update donations"
  ON public.donations FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE TRIGGER donations_set_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX donations_status_created_idx ON public.donations (status, created_at DESC);

COMMIT;

-- BEGIN BLOCK 2: drizzle 0002 (enum value; must commit before any use)
BEGIN;

-- ------------------------------------------------------------------------
-- SOURCE: drizzle\migrations\0002_add_family_role.sql (verbatim)
-- ------------------------------------------------------------------------
ALTER TYPE public.app_role ADD VALUE 'family';

COMMIT;

-- BEGIN BLOCK 3: drizzle 0003 + 0004 + 0005 (uses the family value)
BEGIN;

-- ------------------------------------------------------------------------
-- SOURCE: drizzle\migrations\0003_family_portal.sql (verbatim)
-- ------------------------------------------------------------------------
CREATE TABLE public.family_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, resident_id)
);

GRANT SELECT, DELETE ON public.family_access TO authenticated;
GRANT ALL ON public.family_access TO service_role;

ALTER TABLE public.family_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family users read own links"
  ON public.family_access FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Staff read all family links"
  ON public.family_access FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'caregiver'));

CREATE POLICY "Staff unlink family access"
  ON public.family_access FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'caregiver'));

CREATE POLICY "Family read linked residents"
  ON public.residents FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'family')
    AND EXISTS (
      SELECT 1 FROM public.family_access fa
      WHERE fa.resident_id = residents.id AND fa.user_id = auth.uid()
    )
  );

CREATE POLICY "Family read linked observations"
  ON public.health_observations FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'family')
    AND EXISTS (
      SELECT 1 FROM public.family_access fa
      WHERE fa.resident_id = health_observations.resident_id AND fa.user_id = auth.uid()
    )
  );

CREATE POLICY "Family read linked appointments"
  ON public.medical_appointments FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'family')
    AND EXISTS (
      SELECT 1 FROM public.family_access fa
      WHERE fa.resident_id = medical_appointments.resident_id AND fa.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.ensure_staff_account(_full_name text DEFAULT ''::text)
 RETURNS app_role
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _uid UUID := auth.uid();
  _role public.app_role;
  _email text;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.profiles (id, full_name)
  VALUES (_uid, COALESCE(NULLIF(trim(_full_name), ''), ''))
  ON CONFLICT (id) DO UPDATE
    SET full_name = CASE
      WHEN public.profiles.full_name = '' THEN COALESCE(NULLIF(trim(EXCLUDED.full_name), ''), '')
      ELSE public.profiles.full_name
    END;

  SELECT role INTO _role FROM public.user_roles WHERE user_id = _uid LIMIT 1;
  IF _role IS NOT NULL THEN
    RETURN _role;
  END IF;

  SELECT email INTO _email FROM auth.users WHERE id = _uid;

  IF EXISTS (
    SELECT 1 FROM public.resident_registrations rr
    WHERE rr.status = 'approved'
      AND lower(rr.contact_email) = lower(_email)
  ) THEN
    _role := 'family';
  ELSIF EXISTS (SELECT 1 FROM public.user_roles) THEN
    _role := 'caregiver';
  ELSE
    _role := 'admin';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  IF _role = 'family' THEN
    INSERT INTO public.family_access (user_id, resident_id)
    SELECT _uid, rr.resident_id
    FROM public.resident_registrations rr
    WHERE rr.status = 'approved'
      AND rr.resident_id IS NOT NULL
      AND lower(rr.contact_email) = lower(_email)
    ON CONFLICT (user_id, resident_id) DO NOTHING;
  END IF;

  RETURN _role;
END;
$function$;

CREATE OR REPLACE FUNCTION public.approve_registration(_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _r public.resident_registrations;
  _resident_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO _r FROM public.resident_registrations WHERE id = _id FOR UPDATE;
  IF _r.id IS NULL THEN
    RAISE EXCEPTION 'Registration not found';
  END IF;
  IF _r.status = 'approved' THEN
    RETURN _r.resident_id;
  END IF;

  INSERT INTO public.residents (full_name, gender, date_of_birth, admission_date, mobility, status, notes, created_by)
  VALUES (
    _r.full_name,
    _r.gender,
    _r.date_of_birth,
    COALESCE(_r.preferred_admission_date, CURRENT_DATE),
    _r.mobility,
    'active',
    NULLIF(concat_ws(E'\n',
      NULLIF(_r.resident_notes, ''),
      CASE WHEN COALESCE(_r.known_conditions, '') <> '' THEN 'Known at intake: ' || _r.known_conditions END,
      CASE WHEN COALESCE(_r.current_medicines, '') <> '' THEN 'Medicines at intake: ' || _r.current_medicines END,
      'Contact: ' || _r.contact_name || COALESCE(' (' || _r.contact_relationship || ')', '') || ' — ' || _r.contact_phone
    ), ''),
    auth.uid()
  )
  RETURNING id INTO _resident_id;

  UPDATE public.resident_registrations
  SET status = 'approved', resident_id = _resident_id, reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = _id;

  IF COALESCE(_r.contact_email, '') <> '' THEN
    INSERT INTO public.family_access (user_id, resident_id, created_by)
    SELECT u.id, _resident_id, auth.uid()
    FROM auth.users u
    WHERE lower(u.email) = lower(_r.contact_email)
    ON CONFLICT (user_id, resident_id) DO NOTHING;
  END IF;

  RETURN _resident_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.link_family_by_email(_email text, _resident_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid;
  _id uuid;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'caregiver')) THEN
    RAISE EXCEPTION 'Only staff can link family accounts';
  END IF;

  SELECT id INTO _uid FROM auth.users WHERE lower(email) = lower(trim(_email));
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'No account found for that email. Ask the family member to create an account first.';
  END IF;

  INSERT INTO public.family_access (user_id, resident_id, created_by)
  VALUES (_uid, _resident_id, auth.uid())
  ON CONFLICT (user_id, resident_id) DO NOTHING
  RETURNING id INTO _id;

  RETURN _id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.link_family_by_email(text, uuid) TO authenticated;

-- ------------------------------------------------------------------------
-- SOURCE: drizzle\migrations\0004_ensure_family_account.sql (verbatim)
-- ------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ensure_family_account(_full_name text DEFAULT '')
RETURNS app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
  _role public.app_role;
  _email text;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.profiles (id, full_name)
  VALUES (_uid, COALESCE(NULLIF(trim(_full_name), ''), ''))
  ON CONFLICT (id) DO NOTHING;

  SELECT role INTO _role FROM public.user_roles WHERE user_id = _uid
  ORDER BY (role = 'admin') DESC, (role = 'caregiver') DESC LIMIT 1;
  IF _role IS NOT NULL THEN
    RETURN _role;
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'family')
  ON CONFLICT (user_id, role) DO NOTHING;

  SELECT email INTO _email FROM auth.users WHERE id = _uid;
  INSERT INTO public.family_access (user_id, resident_id)
  SELECT _uid, rr.resident_id
  FROM public.resident_registrations rr
  WHERE rr.status = 'approved' AND rr.resident_id IS NOT NULL
    AND lower(rr.contact_email) = lower(_email)
  ON CONFLICT (user_id, resident_id) DO NOTHING;

  RETURN 'family';
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_family_account(text) TO authenticated;

-- ------------------------------------------------------------------------
-- SOURCE: drizzle\migrations\0005_staff_only_guard.sql (verbatim)
-- ------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_staff(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT public.has_role(_uid,'admin') OR public.has_role(_uid,'caregiver')
$$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['residents','health_observations','medical_appointments','medical_conditions','medicines','medicine_administrations','rooms','beds','resident_bed_assignments','care_settings','resident_registrations','donations']
  LOOP
    IF t NOT IN ('residents','health_observations','medical_appointments') THEN
      EXECUTE format('CREATE POLICY "Staff only read guard" ON public.%I AS RESTRICTIVE FOR SELECT TO authenticated USING (public.is_staff(auth.uid()))', t);
    END IF;
    IF t NOT IN ('resident_registrations','donations') THEN
      EXECUTE format('CREATE POLICY "Staff only insert guard" ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()))', t);
    END IF;
    EXECUTE format('CREATE POLICY "Staff only update guard" ON public.%I AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "Staff only delete guard" ON public.%I AS RESTRICTIVE FOR DELETE TO authenticated USING (public.is_staff(auth.uid()))', t);
  END LOOP;
END $$;

CREATE POLICY "Staff or linked family read guard" ON public.residents AS RESTRICTIVE FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.family_access fa WHERE fa.resident_id = residents.id AND fa.user_id = auth.uid()));
CREATE POLICY "Staff or linked family read guard" ON public.health_observations AS RESTRICTIVE FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.family_access fa WHERE fa.resident_id = health_observations.resident_id AND fa.user_id = auth.uid()));
CREATE POLICY "Staff or linked family read guard" ON public.medical_appointments AS RESTRICTIVE FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.family_access fa WHERE fa.resident_id = medical_appointments.resident_id AND fa.user_id = auth.uid()));

COMMIT;

-- ============================================================================
-- VERIFICATION (read-only). Expected values are derived from the 14 source
-- files; a fresh Supabase project contributes no objects to schema public.
-- ============================================================================
SELECT count(*) AS public_tables_expect_15
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

SELECT count(*) AS rls_enabled_expect_15
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity;

SELECT count(*) AS policies_expect_101
FROM pg_policies WHERE schemaname = 'public';

SELECT count(*) AS functions_expect_10
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public';

SELECT count(*) AS triggers_expect_14
FROM pg_trigger t
  JOIN pg_class c ON c.oid = t.tgrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND NOT t.tgisinternal;

SELECT count(*) AS named_indexes_expect_11
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN ('idx_observations_resident','idx_conditions_resident',
    'medical_appointments_resident_idx','medical_appointments_scheduled_idx',
    'beds_room_id_idx','bed_single_active_occupant','resident_single_active_bed',
    'medicines_resident_id_idx','medicine_admin_resident_idx',
    'resident_registrations_status_idx','donations_status_created_idx');

SELECT count(DISTINCT t.oid) AS enums_expect_12
FROM pg_type t
  JOIN pg_enum e ON e.enumtypid = t.oid
  JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public';

SELECT string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder)
         AS app_role_labels_expect_admin_caregiver_family
FROM pg_type t
  JOIN pg_enum e ON e.enumtypid = t.oid
  JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public' AND t.typname = 'app_role';

-- expect exactly two rows: donations = INSERT, resident_registrations = INSERT
-- (plus anything a project template pre-grants, if anything)
SELECT table_name, string_agg(privilege_type, ',' ORDER BY privilege_type) AS anon_privs
FROM information_schema.table_privileges
WHERE table_schema = 'public' AND grantee = 'anon'
GROUP BY table_name ORDER BY table_name;

-- expect NO rows: no client role may hold INSERT/UPDATE/DELETE on audit-like
-- tables is enforced by policy, but here we confirm anon holds no SELECT
SELECT count(*) AS anon_select_grants_expect_0
FROM information_schema.table_privileges
WHERE table_schema = 'public' AND grantee = 'anon' AND privilege_type = 'SELECT';