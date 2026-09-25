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