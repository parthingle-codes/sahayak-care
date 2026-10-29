-- Migration 0007: Add DigiLocker DEMO MODE column to resident_registrations
-- Applied manually via the Supabase SQL Editor. Safe to run on an existing database.
-- This column tracks only a simulated demo flow; it never represents real identity verification.

ALTER TABLE public.resident_registrations
  ADD COLUMN IF NOT EXISTS digilocker_status text
    NOT NULL DEFAULT 'unverified'
    CONSTRAINT digilocker_status_values
      CHECK (digilocker_status IN ('unverified', 'demo_completed'));

-- Tighten the anonymous INSERT policy so public submitters cannot supply a
-- non-default digilocker_status value.  All existing conditions (status,
-- reviewed_by, resident_id) are preserved; we simply add the new one.
DROP POLICY IF EXISTS "Anyone can submit a registration" ON public.resident_registrations;

CREATE POLICY "Anyone can submit a registration"
  ON public.resident_registrations FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND reviewed_by IS NULL
    AND resident_id IS NULL
    AND digilocker_status = 'unverified'
  );

-- No changes needed to the staff UPDATE guard: the restrictive
-- "Staff only update guard" created in migration 0005 already blocks every
-- UPDATE from non-staff (anon / family) users, including writes to the new
-- column.  Staff (admin + caregiver) can set digilocker_status = 'demo_completed'
-- through the existing authenticated UPDATE path.
