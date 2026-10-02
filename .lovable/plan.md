# Sahaayak — App-wide UI polish (from the Master UI brief)

Goal: make every staff and public screen look like a finished healthcare product, while keeping all features, data, forms, and sign-in behaviour exactly as they are. Existing teal + warm sand colours, Sora headings and Plus Jakarta Sans body stay.

## What changes (screen by screen)

1. **Shared look** — one consistent status badge (Completed / Upcoming / Overdue / Pending / Inactive, each with icon + colour meaning: green, amber, red, blue, gray), refined cards, buttons, inputs, dialogs, loading skeletons, friendly empty and error states.
2. **Header & sidebar** — clearer active menu item, page title area, tidy account menu, better mobile menu.
3. **Dashboard** — "Good morning/afternoon, {name}" welcome with "Here's what needs your attention today", then metric cards using only real data (residents, overdue / upcoming observations, pending registrations, pending donations), and an "Attention required" list first.
4. **Residents** — card/table list with photo-initial avatar, room/bed, status badge, quick search filter; profile page split into Personal, Health, Upcoming appointments, Medical history, Notes sections.
5. **Appointments & Health records** — clear Overdue / Upcoming / Completed grouping with the shared badges and timeline-style history.
6. **Registrations, Donations, Rooms, Settings** — consistent tabs, counts, and card layout.
7. **Public pages** (Register, Donate, Sign in, Family sign in, Family updates) — calmer form layout, step grouping, larger tap targets, clear success screens.
8. **Accessibility & mobile** — readable sizes, focus rings, contrast, layouts checked on phone, tablet and desktop.

## Not changing
No database changes, no route removals, no fake analytics, no new libraries, no medical-advice wording.

## Order
Shared pieces → shell → dashboard → residents → appointments/health → other staff pages → public pages → browser check on all screens at phone and desktop sizes.

## Technical details
- New `src/components/common/StatusBadge.tsx` mapping statuses to existing due/done/alert/info/muted tokens; replace ad-hoc badge styling.
- Add `PageSkeleton`, `ErrorState` alongside existing `EmptyState`, `PageHeader`, `StatCard` (upgrade these in place).
- Only semantic tokens from `src/styles.css`; add a few utilities (e.g. `surface-elevated`) if needed, no palette change.
- Query hooks in `src/features/*` untouched; presentation-only edits in routes/components.
