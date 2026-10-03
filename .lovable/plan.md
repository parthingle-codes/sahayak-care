# SAHAAYAK UI polish: finishing pass (looks only)

This changes how the app looks. Nothing about how it works changes: the database, sign-in, permissions, forms, saving and calculations all stay as they are. Teal and sand colours, Sora headings and Plus Jakarta Sans body text stay.

## Sections in the brief that won't be brought back
The brief mentions Medicines, Rooms & Beds and Reports. You asked earlier for all three to be removed, so they stay removed. Their records are still stored in the database.

## Ground rules
- Every menu item you have now stays. Removed sections are not brought back.
- Pages keep their current web addresses and sign-in checks.
- Every number and list on screen comes from your real records. Nothing is made up.
- No database or behind-the-scenes changes.

## Home page (main entry point)
A new layout built around the headline "Manage care with clarity", with three clear paths:
- **For Care Teams:** Staff sign in
- **For Families:** Family access (Family sign in)
- **For Facilities:** Register a resident and Contact

The Donate button and every other link already on the page stays, with the same destination.

## What gets polished
1. **Shared look:** the same spacing, title sizes, card borders and shadows everywhere. Fewer heavily rounded cards (closer to Linear or Stripe). Tables, tabs, search boxes, dialogs and dropdowns get one consistent style. Status colours stay restrained.
2. **Menu and top bar:** a tidier header with a page title and breadcrumb where it helps, a consistent content width and a better menu on phones. Every menu item stays.
3. **Dashboard:** built around "What needs attention today?". Overdue items come first, then clearer number cards and an easier-to-read recent observations list. Everything shown comes from real data.
4. **Residents:** an easier-to-read list, a clear search box and status filter, a status label on each resident and a table that also works on phones. The resident profile gets clearly separated sections: Personal, Health, Upcoming, Medical history, Notes and Family access.
5. **Health records:** a cleaner vitals table, conditions shown as cards and controls grouped together.
6. **Appointments:** Overdue, Upcoming and Completed sections, with dates made easy to see. The 14-day cycle works the same.
7. **Registrations, Donations, Settings:** the same tabs with counts and the same card and table style.
8. **Public pages** (Home, Register, Donate, Sign in, Family sign in, Family updates): calmer forms and a polished Family updates page.
9. **Loading, empty and error messages:** the same friendly versions on every page.
10. **Accessibility:** text that's easy to read, visible focus outlines, enough contrast and bigger tap targets.

## Final check
Open every page in a browser at phone and desktop sizes, and confirm there are no errors.

## Technical details
- Changes go only in presentation code (routes and components) and the shared style file. Query hooks, server functions and the database are not touched, and no new libraries are added.
- Route definitions (paths, beforeLoad guards, loaders) stay unchanged. Only the components and head() text change.
- "Contact" on the home page reuses existing details (the registration route and footer contact). No new route is created.
- Reuse the existing StatusBadge, StatCard, PageHeader, EmptyState, ErrorState and PageSkeleton. Adjust the shadcn card, table and tabs styles through tokens only.
