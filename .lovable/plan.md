# SAHAAYAK — Architecture, Data Model & Milestones

Building Technology with Compassion. A care-management platform for small elderly care homes (15–50 residents, scalable further).

## 1. Stack note (one deviation to confirm)

Everything you listed is already the stack here — React 19 + TypeScript + Vite + Tailwind + shadcn/ui, Lovable Cloud (Postgres + Auth + RLS + Storage) for the backend, TanStack Query, Lucide icons.

One difference: this project runs on **TanStack Router (file-based routes)**, not React Router. It is fixed in this template and cannot be swapped. It is functionally equivalent (routes, params, protected layouts) and simple to explain in a viva. Server-side logic uses **server functions** instead of edge functions — same idea, less setup.

## 2. Architecture

```text
src/
  routes/                 URL structure (file-based)
    index.tsx             public landing + sign-in CTA
    auth.tsx              login
    _authenticated/       protected app shell (sidebar layout)
      dashboard.tsx
      residents.tsx | residents.$id.tsx
      health-records.tsx
      medicines.tsx
      appointments.tsx
      rooms.tsx
      visitors.tsx
      reports.tsx
      settings.tsx
  components/
    ui/                   shadcn primitives
    layout/               AppSidebar, Topbar, PageHeader
    common/               DataTable, EmptyState, ConfirmDialog, StatCard, SearchInput
    residents/ health/ medicines/ ...  feature components
  features/<domain>/      queries.ts (TanStack Query) + schema.ts (Zod) + types.ts
  lib/                    utils, formatters, permissions
  hooks/                  useAuth, useRole, useDebounce
```

Rules we hold to: data access lives in `features/*/queries.ts` only; components never call the database directly; Zod schemas are the single source of truth for form validation and types; one reusable `DataTable` for every list screen.

## 3. Database design

Confirmed relationships only — nothing invented from field-visit assumptions. Fields marked *optional* stay nullable so the facility can adopt gradually.

Core:
- `profiles` — one row per staff user (id → auth user, full_name, phone, active)
- `user_roles` — (user_id, role) with enum `admin | caregiver`, separate table for security; `has_role()` security-definer function drives all policies
- `rooms` — name, floor, gender_preference *optional*, notes
- `beds` — room_id, label, status (`available | occupied | maintenance`), unique (room_id, label)
- `residents` — full_name, date_of_birth *optional*, gender, photo_path, admission_date, bed_id *nullable*, mobility (`independent | walker | wheelchair | bedridden`), status (`active | discharged | deceased`), notes
- `emergency_contacts` — resident_id, name, relation, phone, is_primary
- `caregiver_assignments` — caregiver_id, resident_id, active (drives "my residents")

Care & health:
- `medical_conditions` — resident_id, condition, diagnosed_on *optional*, notes (replaces a vague "medical history" blob)
- `allergies` — resident_id, substance, severity
- `health_observations` — resident_id, recorded_by, recorded_at, bp_systolic, bp_diastolic, pulse, temperature_c, blood_sugar, weight_kg, note (all vitals nullable — record only what was measured)
- `medicines` — resident_id, name, dosage, form, instructions, start_date, end_date *nullable*, active
- `medicine_schedules` — medicine_id, time_of_day (time), days_of_week (default daily)
- `medicine_administrations` — schedule_id, resident_id, due_date, due_time, status (`pending | given | missed | refused`), given_at, given_by, note; unique (schedule_id, due_date, due_time) so today's list is generated deterministically and never duplicated
- `doctors` — name, specialization, phone
- `appointments` — resident_id, doctor_id *nullable*, doctor_name fallback, scheduled_at, purpose, status, outcome_note
- `visitors` — resident_id, name, relation, phone, check_in, check_out *nullable*
- `audit_logs` — actor_id, action, entity, entity_id, meta jsonb

No diagnoses, prescriptions-as-medical-advice, or ID numbers stored. Every table: timestamps, foreign keys with sensible `on delete`, indexes on `resident_id` and date columns, `GRANT`s plus RLS.

Access model: admins read/write everything; caregivers read residents and write observations, administrations, and visitors; nothing is readable anonymously.

## 4. Navigation

Sidebar, role-aware:

| Section | Items | Admin | Caregiver |
| --- | --- | --- | --- |
| Overview | Dashboard | yes | yes |
| People | Residents | full | read + care actions |
| Care & Health | Health Records, Medicines, Appointments | yes | yes |
| Facility | Rooms & Beds, Visitors | yes | Visitors only |
| Insights | Reports | yes | no |
| — | Settings (staff & roles) | yes | own profile |

Resident profile at `/residents/:id` is the hub, tabbed: Overview · Medical · Medicines · Health Records · Appointments · Visitors. Emergency contacts pinned in the header so they are always one glance away.

## 5. Design system

Calm clinical, not hospital-bright: deep teal primary, warm sand neutrals, white cards, generous spacing, 16px+ body text, restrained accents (amber = due, red = missed/alert, green = done). All tokens in `src/styles.css`; shadcn variants only, no ad-hoc color classes. Sidebar shell with a light content canvas — Linear/Stripe density, larger type for older staff.

## 6. Dashboard (answers "what needs my attention today?")

Row of stat cards (active residents, beds free, medicines due today, appointments today) then two working lists: **pending medicine administrations for now/soon** with one-tap Mark given, and **today's appointments**. Below: recent observations and alerts (missed doses, unassigned residents, empty emergency contacts). No decorative charts.

## 7. Milestones

1. Design system + app shell + sidebar (no data)
2. Cloud enable, auth, roles, protected routes, role-aware nav
3. Residents schema + list, profile, create/edit, photo upload, demo seed data
4. Rooms & beds, bed assignment with occupancy safety
5. Medical conditions, allergies, health observations + timeline
6. Medicines, schedules, today's administration board
7. Appointments, doctors, emergency contacts
8. Dashboard wiring, global search, filters, reports
9. Visitors + reminders/notifications
10. Optional AI health summary (clearly labelled, no diagnosis, no treatment advice)
11. QA pass: validation, empty/loading/error states, security review, demo script

We finish and verify each milestone before starting the next.

## 8. What I need from you

- Confirm TanStack Router is acceptable (it is not swappable here).
- Confirm the role set is exactly Admin + Caregiver for v1.
- Should resident photos be included, or names/initials only for privacy?

Once approved, I start Milestone 1.
