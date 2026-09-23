# Online Resident Registration (replaces paper admission forms)

Goal: a family or the care home can fill an admission form online. Staff review the submission and, with one click, it becomes a resident record — no re-typing.

## How it works

1. A public page `/register` holds the admission form. Anyone with the link can fill it; no account needed.
2. Submitting saves a pending **registration request** and shows a confirmation with a reference number.
3. Staff see a new "Registrations" item in the sidebar with a count of pending requests.
4. On a request, staff can:
   - **Approve** — creates the resident from the submitted details and marks the request approved (links to the new resident).
   - **Reject** — marks it rejected with an optional reason.
   - Edit the details before approving, so typos get fixed once.
5. Dashboard gets one small card: "Pending registrations".

## Form fields

Resident: full name (required), gender, date of birth, mobility, preferred admission date, notes.
Contact person: name (required), relationship, phone (required), email, address.
Health at intake: known conditions / allergies, current medicines (free text — staff structure it later).

All optional fields stay optional so a family can submit with what they know. Validation on name, phone and email; clear error messages.

## Notes

- The form is not medical advice and stores no ID numbers — same rule as the rest of the app.
- No emails are sent in this step; staff check the Registrations page. Email notification can be added later if you want it.

## Technical section

- New table `resident_registrations`: submitted resident + contact + intake text fields, `status` enum (`pending | approved | rejected`), `reviewed_by`, `reviewed_at`, `review_note`, `resident_id` (set on approval), timestamps + GRANTs + RLS.
- RLS: `anon`/`authenticated` may INSERT only; SELECT/UPDATE restricted to authenticated staff; DELETE admin only. No anonymous reads (submissions contain personal data).
- Approval runs through a security-definer function `approve_registration(_id uuid)` that inserts into `residents`, stamps the request, and returns the new resident id — keeps the two writes atomic.
- Public submission goes through an unauthenticated server function using the publishable key, with Zod validation server-side as well as in the form.
- Files: `src/routes/register.tsx` (public, own `head()` meta), `src/routes/_shell/registrations.tsx` (staff queue with pending/approved/rejected tabs), `src/features/registrations/queries.ts`, `src/components/registrations/ReviewRegistrationDialog.tsx`.
- Sidebar entry added to `src/lib/navigation.ts` for admin + caregiver; landing page gets a "Register a resident" link.
- Reuse existing PageHeader, EmptyState, StatCard and table patterns — no new design tokens.

## Build order

1. Table, policies, approval function.
2. Public form page + submission.
3. Staff registrations queue with approve / reject / edit-then-approve.
4. Dashboard pending card + sidebar and landing-page links.
