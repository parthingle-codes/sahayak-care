-- restore/demo_residents.sql
-- SYNTHETIC demo data for the SAHAAYAK pitch — 8 clearly fake residents so the
-- resident-care dashboard can be demonstrated on the NEW Supabase project.
--
-- Safety guarantees:
--   * Idempotent: guarded with NOT EXISTS on full_name — running it twice
--     creates no duplicates and never updates existing rows.
--   * Fictional, non-contactable data only. Every name is "Demo Resident NN";
--     every note is explicitly marked as a demo record.
--   * created_by is left NULL (the column is nullable) — no auth user UUID is
--     invented or copied.
--   * Respects the schema: gender_type ('male'|'female'|'other'),
--     mobility_level ('independent'|'walker'|'wheelchair'|'bedridden') and
--     resident_status ('active'|'discharged'|'deceased') use real enum values;
--     room_label is free text (no FK), so demo labels are safe.
--   * Does NOT disable RLS, alter the schema, or touch any pre-existing row.
--
-- HOW TO RUN (manually, in the NEW Supabase project):
--   1. Supabase dashboard -> new project -> SQL Editor.
--   2. Paste this entire file and press Run. Expect "INSERT 0 8" the first
--      time and "INSERT 0 0" on any later run.
--   3. Open SAHAAYAK -> sign in as staff -> Residents page: the 8 demo
--      residents appear alongside any real ones (they are ordinary rows).

INSERT INTO public.residents (
  full_name,
  gender,
  date_of_birth,
  admission_date,
  mobility,
  status,
  room_label,
  notes
)
SELECT
  v.full_name,
  v.gender::public.gender_type,
  v.date_of_birth::date,
  v.admission_date::date,
  v.mobility::public.mobility_level,
  v.status::public.resident_status,
  v.room_label,
  v.notes
FROM (VALUES
  ('Demo Resident 01', 'male',   '1946-03-14', '2025-11-02', 'independent', 'active',      'D-01', '[DEMO RECORD] Synthetic data for demonstration only. Not a real person.'),
  ('Demo Resident 02', 'female', '1949-07-22', '2025-11-05', 'walker',      'active',      'D-02', '[DEMO RECORD] Synthetic data for demonstration only. Not a real person.'),
  ('Demo Resident 03', 'female', '1943-01-09', '2025-11-08', 'wheelchair',  'active',      'D-03', '[DEMO RECORD] Synthetic data for demonstration only. Not a real person.'),
  ('Demo Resident 04', 'male',   '1951-11-30', '2025-11-10', 'independent', 'active',      'D-04', '[DEMO RECORD] Synthetic data for demonstration only. Not a real person.'),
  ('Demo Resident 05', 'male',   '1940-05-17', '2025-11-12', 'bedridden',   'active',      'D-05', '[DEMO RECORD] Synthetic data for demonstration only. Not a real person.'),
  ('Demo Resident 06', 'other',  '1947-09-03', '2025-11-15', 'walker',      'active',      'D-06', '[DEMO RECORD] Synthetic data for demonstration only. Not a real person.'),
  ('Demo Resident 07', 'female', '1953-02-26', '2025-11-18', 'independent', 'discharged',  'D-07', '[DEMO RECORD] Synthetic data for demonstration only. Discharged for status variety.'),
  ('Demo Resident 08', 'male',   '1944-12-08', '2025-11-20', 'wheelchair',  'active',      'D-08', '[DEMO RECORD] Synthetic data for demonstration only. Not a real person.')
) AS v(full_name, gender, date_of_birth, admission_date, mobility, status, room_label, notes)
WHERE NOT EXISTS (
  SELECT 1 FROM public.residents r WHERE r.full_name = v.full_name
);
