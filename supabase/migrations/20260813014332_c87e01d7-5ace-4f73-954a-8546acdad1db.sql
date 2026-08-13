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