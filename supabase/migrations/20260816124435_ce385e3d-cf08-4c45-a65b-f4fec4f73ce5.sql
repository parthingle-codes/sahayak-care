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