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