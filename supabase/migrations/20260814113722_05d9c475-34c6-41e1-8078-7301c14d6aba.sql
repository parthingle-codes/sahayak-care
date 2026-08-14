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