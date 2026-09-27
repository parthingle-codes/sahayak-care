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