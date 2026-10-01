# Family sees only their own resident + bigger Family sign-in button

## The problem
The database lets any signed-in account read every resident, health update and checkup. The "staff can read" rules don't check whether the account belongs to staff. A family account matches those rules too, so it can see everyone. Some "staff can update" rules have the same gap, which means a family account could also change records.

## What changes
1. **Lock staff rules to staff only.** Every rule that currently allows "any signed-in account" will allow only administrators and caregivers. This covers residents, health updates, checkups, medical conditions, medicines, rooms, beds, bed assignments, registrations, donations and care settings.
2. **Family rules stay as they are.** A family account can read only the resident linked to their email, plus that resident's health updates and checkups. They can't edit anything.
3. **Bigger family button on the home page.** Next to "Staff sign in", add a large "Family sign in" button styled to match. The small text link underneath stays as a short explanation.
4. **Finish the earlier family sign-in work:**
   - On the staff sign-in page, the family note will link to the family sign-in page.
   - Signing out of Family updates, or opening it while signed out, will go to the family sign-in page.

## How I'll check it
- Sign in as a test family account and confirm only the linked resident appears, both on the page and through direct data requests.
- Confirm staff still see and edit everything as before.
- Delete the test account afterwards.

## Technical details
- One migration recreates the open policies. Their conditions (SELECT `true`, UPDATE `auth.uid() IS NOT NULL`, INSERT with an open WITH CHECK) become `has_role(auth.uid(),'admin') OR has_role(auth.uid(),'caregiver')`.
- I'll query each table's policies before writing the migration so none are missed. Anonymous insert policies on registrations and donations stay unchanged.
- The front-end changes are in `index.tsx`, `auth.tsx` and `family.tsx`.
