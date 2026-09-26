# Remove Reports + Family Portal (WOW feature)

## 1. Remove the Reports section
- Delete `src/routes/_shell/reports.tsx` and its entry in `src/lib/navigation.ts`.
- Clean up any leftover links/imports. Nothing else depends on it.

## 2. Family Portal — read-only view for residents' families

Families get a simple magic link (no account, no password) to see how their loved one is doing.

### How it works
```text
Staff (resident profile)          Family member (phone/browser)
------------------------          ------------------------------
"Family access" panel      -->    Opens https://.../family/<code>
  Generate link / revoke          Sees: latest health updates,
                                  next checkup date, care notes
```

### Backend
- New table `public.family_links`: id, resident_id, token (random code), label (e.g. "Son — Rahul"), active flag, created_by, timestamps.
- RLS: staff can create/list/revoke links; anonymous visitors can NOT read the table directly.
- Security-definer function `get_family_view(_token text)` that returns only safe data for an active link: resident first name, age, mobility, recent health observations (last 5), next upcoming appointment date, and recent care notes. No staff names, no internal notes, no other residents.

### Frontend
- **Resident profile page** (`/residents/$id`): new "Family access" card — generate a link, copy it, see existing links, revoke one.
- **Public page** `/family/$token`: warm, simple read-only page (no sign-in) showing the resident's latest updates in plain language. Invalid/revoked links show a friendly "link no longer active" message.
- Landing page: small "Family? Ask the home for your access link" note.

### Safety
- Read-only; families cannot edit anything.
- Revoking a link instantly cuts access.
- Only non-sensitive fields are exposed.

## Verification
- `tsgo --noEmit` clean, build OK.
- End-to-end: generate a link for a demo resident, open it in a fresh browser, confirm data shows; revoke and confirm it stops working.
