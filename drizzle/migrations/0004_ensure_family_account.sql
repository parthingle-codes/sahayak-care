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