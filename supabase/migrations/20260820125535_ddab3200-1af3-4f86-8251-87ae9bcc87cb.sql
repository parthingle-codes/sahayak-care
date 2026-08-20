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