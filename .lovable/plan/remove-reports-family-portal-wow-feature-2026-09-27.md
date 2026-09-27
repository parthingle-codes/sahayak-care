# Remove Reports + Family Portal (WOW feature)

## 1. Remove the Reports section
- Delete `src/routes/_shell/reports.tsx` and its entry in `src/lib/navigation.ts`.
- Clean up leftover links/imports. Nothing else depends on it.

## 2. Family Portal — families sign in to see their elder's updates

A family member signs in with the **same email they gave on the online registration form** and gets a warm, read-only view of how their loved one is doing.

### How it works
```text
Registration form (public)        Family member                 Staff
------------------------          --------------                -----
contact_email: rahul@...   -->    Signs up with rahul@...  -->  Auto-linked to the resident
                                  Sees: latest health updates,  (email match from approved
                                  next checkup, care notes       registration; staff can also
                                                                 link/unlink manually)
```

### Backend
- Add `'family'` to the `app_role` enum. New signups whose email matches an approved registration's `contact_email` become **family** (not caregiver); everyone else follows the current first-admin/then-caregiver rule.
- New table `public.family_access`: user_id, resident_id, created_by, timestamps. RLS: staff manage rows; a family user can read only their own rows.
- RLS read policies for family users (scoped through `family_access`) on: `residents` (safe columns only), `health_observations` (latest entries), `medical_appointments` (dates/reason only), so the portal reads real data with the user's own session — no public anonymous access.
- Auto-link: when a registration is approved, if a family account with that `contact_email` exists (or signs up later), the link is created automatically.

### Frontend
- **Public `/family` route** (sign-in required, family role): a calm, simple page — resident's name, age, mobility, recent health observations in plain language, next checkup date, recent care notes. No staff shell, no editing.
- **Auth flow**: after sign-in, family users land on `/family` instead of the staff dashboard.
- **Resident profile** (`/residents/$id`): "Family access" card showing linked family accounts, with manual link/unlink for staff.
- Landing page: "Family of a resident? Sign in to see updates" pointing to the auth page.

### Safety
- Read-only; families cannot edit anything and never see other residents or staff-only notes.
- Staff can unlink a family account at any time.

## Verification
- `tsgo --noEmit` clean, build OK.
- End-to-end: submit a registration with a contact email, approve it, sign up with that email, confirm the family view shows the resident's data; confirm a non-matching account cannot see it.
