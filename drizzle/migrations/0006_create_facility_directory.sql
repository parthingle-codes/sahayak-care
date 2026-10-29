-- 0006: Public facility directory (admin-curated listings of real old-age homes).
-- Split design: `public.facilities` holds intentionally public listing fields only;
-- `public.facility_audit` holds internal verification/audit metadata (admin-read only).
-- No foreign key, trigger, view or policy connects these tables to resident,
-- medical, family, donation or registration data.
-- Applied manually in the Supabase SQL editor (repo convention) — see AGENTS.md.

-- ===== Enums (defined once) =====
CREATE TYPE public.facility_status AS ENUM ('draft', 'published');
CREATE TYPE public.verification_status AS ENUM ('unverified', 'verified');

-- ===== Public listing table — every column is safe to expose =====
CREATE TABLE public.facilities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  summary text,
  description text,
  address_line text,
  city text,
  state text,
  postal_code text,
  country text NOT NULL DEFAULT 'India',
  phone text,
  contact_email text,
  website_url text,
  map_url text,
  review_links jsonb NOT NULL DEFAULT '[]'
    CHECK (jsonb_typeof(review_links) = 'array'),
  status public.facility_status NOT NULL DEFAULT 'draft',
  verification public.verification_status NOT NULL DEFAULT 'unverified',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Authoritative publication invariant: no write path (PostgREST, RPC,
  -- dashboard SQL) can leave a row published unless it is verified.
  CONSTRAINT facilities_published_requires_verified
    CHECK (status <> 'published' OR verification = 'verified')
);

CREATE INDEX facilities_published_idx
  ON public.facilities (status) WHERE status = 'published';

-- ===== Internal audit metadata — never readable or writable by clients =====
CREATE TABLE public.facility_audit (
  facility_id uuid PRIMARY KEY
    REFERENCES public.facilities(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at timestamptz,
  verification_note text,
  -- Verification evidence must exist whenever a verification is recorded.
  -- (verified_by is nullable so deleting an auth user cannot deadlock on this
  --  check; set_facility_verification() always records it at verify time.)
  CONSTRAINT facility_audit_verified_needs_note
    CHECK (verified_at IS NULL OR btrim(coalesce(verification_note, '')) <> '')
);

-- ===== updated_at trigger (reuses existing helper) =====
CREATE TRIGGER facilities_set_updated_at
  BEFORE UPDATE ON public.facilities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== Audit row is created with the listing (definer = table owner) =====
CREATE OR REPLACE FUNCTION public.facility_audit_bootstrap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.facility_audit (facility_id, created_by)
  VALUES (NEW.id, auth.uid())
  ON CONFLICT (facility_id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.facility_audit_bootstrap() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER facilities_audit_insert
  AFTER INSERT ON public.facilities
  FOR EACH ROW EXECUTE FUNCTION public.facility_audit_bootstrap();

-- ===== Verification workflow: the ONLY path that writes the verification
-- column and the audit evidence, in one transaction =====
CREATE OR REPLACE FUNCTION public.set_facility_verification(
  _facility_id uuid,
  _verification public.verification_status,
  _note text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only administrators can change verification';
  END IF;

  IF _verification = 'verified' AND btrim(coalesce(_note, '')) = '' THEN
    RAISE EXCEPTION 'Verification requires a non-empty audit note';
  END IF;

  UPDATE public.facilities SET verification = _verification WHERE id = _facility_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Facility not found';
  END IF;

  UPDATE public.facility_audit SET
    verified_by = CASE WHEN _verification = 'verified' THEN auth.uid() END,
    verified_at = CASE WHEN _verification = 'verified' THEN now() END,
    verification_note = CASE WHEN _verification = 'verified' THEN _note END
  WHERE facility_id = _facility_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_facility_verification(uuid, public.verification_status, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_facility_verification(uuid, public.verification_status, text)
  TO authenticated;

-- ===== Grants: revoke platform defaults first, then grant the minimum =====
REVOKE ALL ON public.facilities FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.facility_audit FROM PUBLIC, anon, authenticated;

-- Public: read every column of published listings (all columns are public by design)
GRANT SELECT ON public.facilities TO anon, authenticated;

-- Authenticated writes: content columns only. status, verification, id,
-- created_at and updated_at are absent from INSERT (defaults always apply,
-- so creation can never be published/verified); verification is absent from
-- UPDATE too, so verification can only ever change via the RPC above.
GRANT INSERT (slug, name, summary, description, address_line, city, state,
              postal_code, country, phone, contact_email, website_url,
              map_url, review_links)
  ON public.facilities TO authenticated;

GRANT UPDATE (slug, name, summary, description, address_line, city, state,
              postal_code, country, phone, contact_email, website_url,
              map_url, review_links, status)
  ON public.facilities TO authenticated;

GRANT DELETE ON public.facilities TO authenticated;

-- Audit: admins read via the policy below; NO client role holds any DML
-- privilege — rows are produced only by the definer trigger and RPC above.
GRANT SELECT ON public.facility_audit TO authenticated;

-- ===== Row Level Security =====
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published facilities are public" ON public.facilities
  FOR SELECT TO anon, authenticated USING (status = 'published');

CREATE POLICY "Admins read all facilities" ON public.facilities
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert draft listings" ON public.facilities
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin')
              AND status = 'draft' AND verification = 'unverified');

CREATE POLICY "Admins update facilities" ON public.facilities
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete facilities" ON public.facilities
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins read facility audit" ON public.facility_audit
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
