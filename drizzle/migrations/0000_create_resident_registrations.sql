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