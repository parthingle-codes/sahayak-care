# SAHAAYAK — what to build next, and what to cut

Right now four sidebar pages are still empty placeholders with no data behind them: Medicines, Appointments, Visitors, Reports. Rooms & Beds is also a placeholder (residents currently store a plain room label). Working with real data today: Residents, Health Records (vitals + medical conditions), Settings staff directory, and the Dashboard, whose stat cards still show "—".

## Recommended: cut these (simpler app, stronger demo)

1. **Rooms & Beds page** — residents already have a `room_label` field. A separate rooms/beds inventory doubles the data entry for a 15–50 resident home. Remove the page and the sidebar item; keep the room label on the resident form.
2. **Reports page** — the dashboard already answers "what needs attention today". A separate reports screen adds charts nobody in a small home reads. Remove it, and instead put a "Download resident report (PDF/print)" action on the resident profile later if wanted.
3. **Visitors page** — nice-to-have; most small homes keep a paper register. Remove unless you specifically need it for the project scope.

Removing these three drops the sidebar from 9 items to 5 and removes 3 dead ends a viva examiner would click into.

## Recommended: build these (in this order)

1. **Resident profile page** (`/residents/:id`) — the missing hub. Tabs: Overview, Medical conditions, Vitals timeline, Medicines, Appointments. Today all care data lives in flat tables with no per-resident view.
2. **Medicines + today's dose board** — medicines per resident (name, dosage, times), and a daily list of due doses with one-tap "Given / Missed / Refused". This is the highest-value daily screen for caregivers.
3. **Live dashboard** — replace the "—" stat cards with real counts (active residents, doses due today, appointments today, observations today) plus a "needs attention" list.
4. **Appointments** — resident, doctor name, date/time, purpose, status, outcome note. Small table + form, same pattern as conditions.
5. **Emergency contacts** — name, relation, phone per resident, pinned on the profile header. Small, and it is the thing staff actually need in a hurry.
6. **Polish pass** — resident search + status filter, delete (admin only) with confirm dialog, vitals shown with normal-range hints, and "recorded by" names instead of raw IDs.

## Notes

Each step is one milestone: schema migration first, then queries in `src/features/care/queries.ts`, then the screen, verified before moving on. Removals are frontend-only (delete the route files and their `src/lib/navigation.ts` entries) — no database changes needed, since none of those pages have tables yet.

## Decide

- Which of Rooms & Beds / Reports / Visitors should actually go?
- Start with the resident profile page, or the medicines dose board?
