# Donations & Support Pledges

Let anyone offer help — food, clothes, essentials, volunteering time, or money — through a public form, and let staff track and close those offers from inside the app. This mirrors the online registration feature that already works, so it stays small and cheap to build.

No online payment is taken. A money pledge is recorded as an intent with an amount and a note; staff mark it received when the donor actually hands it over. Adding a real payment gateway later is a separate step.

## What the donor sees

A public page at `/donate`, linked from the home page next to "Register a resident":

- Donation type: Food, Clothing, Essentials/Supplies, Financial support, Volunteering, Other
- Description of what they are offering (quantity, condition, etc.)
- Amount (only shown when Financial support is picked)
- Preferred drop-off / availability date, optional
- Name, phone (required), email and address (optional)
- On submit, a thank-you screen with a reference number

## What staff see

A new "Donations" page under People in the side menu, plus a "Pending donations" count on the dashboard:

- Tabs: Pending, Accepted, Received, Declined
- Each card/row shows type, donor, contact, what is offered, amount, date submitted
- Review dialog: edit details, add an internal note, then Accept, Mark received, or Decline with a reason
- Simple totals at the top: pledged amount vs received amount this month, count of in-kind offers

## Technical notes

- New table `public.donations`: `id`, `reference` (auto short code), `donation_type` enum (`food | clothing | essentials | financial | volunteering | other`), `description`, `amount` numeric nullable, `currency` default `INR`, `preferred_date` date nullable, `donor_name`, `donor_phone`, `donor_email`, `donor_address`, `status` enum (`pending | accepted | received | declined`), `staff_note`, `reviewed_by`, `reviewed_at`, timestamps + `set_updated_at` trigger.
- Grants then RLS, matching `resident_registrations`: `anon`/`authenticated` INSERT only when `status = 'pending'` and unreviewed; staff SELECT/UPDATE; admin DELETE. No anonymous reads.
- `src/features/donations/queries.ts` with `useSubmitDonation`, `useDonations`, `useUpdateDonation` (status + note) — same TanStack Query shape as registrations.
- Routes: public `src/routes/donate.tsx` (zod validation, reference success screen), staff `src/routes/_shell/donations.tsx`, plus `DonationReviewDialog` under `src/components/donations/`.
- Nav entry in `src/lib/navigation.ts` (People group, `HandHeart` icon, both roles); home-page button; dashboard stat card linking to `/donations`.
- Existing design tokens and `PageHeader` / `EmptyState` / `StatCard` patterns only — no new styling.
- Each new route gets its own `head()` title and description.

## Out of scope for now

Online card/UPI payment, receipts or 80G tax certificates, donor accounts and login, inventory tracking of donated goods.
