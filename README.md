# SAHAYAK

### Smart Elderly Care & Health Management Platform

> **Building Technology with Compassion.**

SAHAYAK is a modern web-based elderly care management platform that helps small old-age homes organize resident information, daily caregiving and family communication in one calm interface — and lets the public **discover verified care homes** through a dedicated directory.

The project was developed as part of the **Community Engagement Program (CEP)** at **Government College of Engineering, Nagpur (GCOEN)**, exploring how thoughtful technology can simplify elderly-care management and improve access to important information.

---

## 🌿 Problem Statement & Proposed Solution

### Problem

During our Community Engagement Program, our team visited an elderly care facility with roughly **15–20 residents**. The management described a familiar set of problems:

- Resident information, health notes and admission records lived in **scattered paper registers**.
- Caregivers could not quickly answer _"who needs attention today?"_.
- Families had **no reliable way to stay informed** between visits.
- People searching for a trustworthy old-age home had **no clear way to discover or compare real homes** online.

### Solution

SAHAYAK is deliberately **not a hospital-management system**. It focuses on the practical needs of a **small elderly-care facility**:

1. **Inside the care home** — a role-based staff application for resident records, recurring health observations, appointments and family updates, secured end-to-end by PostgreSQL Row Level Security.
2. **For the public** — a verified, administrator-curated **directory of real old-age homes** (`/homes`) with full profiles, contact details, directions and links to genuine external reviews. Every listing is checked and published by an administrator; the database itself refuses to show unverified listings.

The goal is not to replace healthcare professionals, but to provide a reliable digital platform for **care management, information organization and public discoverability**.

---

## ✨ Key Features

### 🏠 Dashboard

A centralized overview designed around **"What needs attention today?"** — active residents, upcoming and overdue medical observations, and recent health records at a glance.

### 👤 Resident Management & Care Tracking

Full resident profiles with personal details, admission information, mobility level, care notes and emergency/family contacts. Each resident has a dedicated profile page (`/residents/$id`) combining all of their information.

### ❤️ Health Observations & Medical Appointments

A recurring medical-observation workflow built around a configurable cycle (default **14 days**). Staff see who is **upcoming, overdue, completed or missed**, record observations, and schedule appointments — prioritized so the next resident to care for is always obvious.

### 👨‍👩‍👧 Family Access & Registration Workflows

- **Public admission form** (`/register`) replaces the paper admission form and creates a pending registration for staff review (`/registrations`).
- **Family portal** (`/family`): family members sign in with the email from their registration form and see a calm, read-only view of their loved one's updates — and nothing else.
- **Donation workflow**: anyone can offer food, clothing, essentials, funds or time (`/donate`); staff review offers on `/donations`.

### 🏡 Public Elderly-Care Home Directory — `/homes`

A public, server-rendered page listing **published and verified** care homes in attractive responsive cards, with search by name or city. Call, website, directions and review buttons appear only when the home's administrator provided that information. Nothing on this page is invented — every field comes from the database.

### 📄 Individual Facility Profiles — `/homes/$slug`

A full profile for each listed home: complete description, structured address, phone, email, official website, a map/directions link, and **genuine external review links** where available. Optional fields disappear gracefully when absent, and SAHAYAK never fabricates ratings, reviews or photos — external reviews are clearly labelled as third-party links.

### 🛡️ Admin Facility Management — `/facilities`

An administrator-only screen (also in the staff sidebar under _Directory_) to **create, edit, verify, publish, unpublish and delete** listings:

- New listings start as **private drafts** — invisible to the public.
- **Verification** requires an internal audit note and runs through a single database function (`set_facility_verification`), so the verified badge always has recorded evidence behind it.
- The database enforces the lifecycle: a listing **cannot be published unless it is verified** (PostgreSQL CHECK constraint + Row Level Security), so the rules hold even outside this UI.

### ⚙️ Settings & Role-Based Access

Three roles — **admin**, **caregiver**, **family** — each see only what they should, enforced by RLS policies in the database, not just in the interface.

---

## 🛠️ Technology Stack

### Frontend

| Layer              | Technology                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Framework          | [TanStack Start](https://tanstack.com/start) (TanStack Router, file-based routes, SSR loaders) on React 19 |
| Build tool         | Vite (Rolldown)                                                                                            |
| Styling            | Tailwind CSS v4 + shadcn/ui (Radix UI primitives)                                                          |
| Data fetching      | TanStack Query                                                                                             |
| Forms & validation | Zod                                                                                                        |
| Icons              | Lucide React                                                                                               |
| Toasts             | Sonner                                                                                                     |

### Backend & Data

- **Supabase** — PostgreSQL, Supabase Auth and Row Level Security as the only backend (no custom API layer)
- Direct, policy-secured client access via `@supabase/supabase-js`
- Hand-written SQL migrations in `drizzle/migrations/`

### Development

- TypeScript (strict), ESLint + Prettier, Git/GitHub, VS Code

---

## 💻 Local Setup

### Prerequisites

- **Node.js 20+** and **npm** (this project uses npm — `package-lock.json`)
- A **Supabase project** (free tier is fine)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root (there is **no** `.env.example` in this repository). The Supabase client refuses to start without these values, so copy the **names** below and fill in your own project's values from _Supabase → Project Settings → API_:

| Variable name                   | Purpose                                              |
| ------------------------------- | ---------------------------------------------------- |
| `VITE_SUPABASE_URL`             | Your Supabase project URL (client bundle)            |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase publishable/anon key (client bundle)   |
| `SUPABASE_URL`                  | Same URL — non-`VITE_` copy used as the SSR fallback |
| `SUPABASE_PUBLISHABLE_KEY`      | Same key — non-`VITE_` copy used as the SSR fallback |

> ⚠️ Never commit `.env` or paste real keys into documentation, screenshots or commits. The `.env` file is git-ignored.

### 3. Set up the database

See the next section.

---

## 🗄️ Database Setup

SAHAYAK has **no automated migration runner**. SQL scripts are a _record_ of the schema and are applied **manually, once, in the Supabase SQL Editor**.

| Script                                                  | What it does                                                                                                                                                                                                       | Status                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| `restore/full_schema_restore.sql`                       | Complete base schema: all tables, enums, functions, triggers, RLS policies and grants (assembled verbatim from migrations 0000–0005). Run this **once on a new/empty Supabase project**.                           | ✅ Already applied to the current pitch database   |
| `drizzle/migrations/0006_create_facility_directory.sql` | The public facility directory: `facilities` + `facility_audit` tables, the `set_facility_verification` function, and the strict admin/public policies.                                                             | ✅ Already applied to the current pitch database   |
| `restore/demo_residents.sql`                            | **Optional.** Seeds 8 clearly synthetic demo residents ("Demo Resident 01–08") so the resident-care dashboard can be demonstrated without real personal data. Idempotent — running it twice creates no duplicates. | ⏳ **Not applied** — run it manually (steps below) |

### How to apply a script

1. Open the Supabase dashboard for your project → **SQL Editor**.
2. Paste the **entire** contents of the script file (`restore/full_schema_restore.sql` must be run as one paste — it contains three transaction blocks).
3. Press **Run**. Re-running the base schema on a database that already has it will fail with "already exists" errors — that is expected and harmless; it means it is already applied.

### Seeding demo residents (optional)

1. SQL Editor → paste all of `restore/demo_residents.sql` → **Run**.
2. Expect `INSERT 0 8` the first time and `INSERT 0 0` on later runs (the script skips names that already exist).
3. Open SAHAYAK → sign in as staff → **Residents** page: the 8 demo records appear alongside any real residents.

The demo rows are fictional and non-contactable, every note is marked `[DEMO RECORD]`, no auth-user ID is invented (`created_by` stays NULL), and the script disables nothing and alters no schema.

---

## ▶️ Running the App

```bash
npm run dev       # start the development server (prints the local URL)
npm run build     # production build
npm run preview   # serve the production build locally
```

### Main routes

| Route                           | Access    | Description                                   |
| ------------------------------- | --------- | --------------------------------------------- |
| `/`                             | Public    | Landing page                                  |
| `/homes`                        | Public    | Elderly-care home directory (server-rendered) |
| `/homes/$slug`                  | Public    | Individual facility profile                   |
| `/register`                     | Public    | Online resident admission form                |
| `/donate`                       | Public    | Public donation form                          |
| `/auth`                         | Public    | Staff sign-in                                 |
| `/family-signin`                | Public    | Family sign-in                                |
| `/family`                       | Family    | Family portal (read-only updates)             |
| `/dashboard`                    | Staff     | "What needs attention today?" overview        |
| `/residents` · `/residents/$id` | Staff     | Resident list and profiles                    |
| `/health-records`               | Staff     | Health observations                           |
| `/appointments`                 | Staff     | Recurring medical observations & appointments |
| `/registrations`                | Staff     | Review online registrations                   |
| `/donations`                    | Staff     | Review donation offers                        |
| `/facilities`                   | **Admin** | Manage directory listings (verify/publish)    |
| `/settings`                     | Staff     | Account & facility settings                   |

Roles: **admin** sees everything including `/facilities`; **caregiver** sees the care screens; **family** users are redirected to `/family` and never see the staff shell. All boundaries are enforced by database policies.

---

## 🧪 Testing & Build Commands

There is no automated test suite yet; verification is typecheck + lint + build, all confirmed working:

```bash
npx tsc --noEmit   # strict TypeScript typecheck
npm run format     # Prettier formatting (run before lint on a fresh checkout)
npm run lint       # ESLint (includes formatting rules)
npm run build      # production build (also regenerates the route tree)
```

---

## 📌 Current Limitations

- **The directory ships empty.** `/homes` only shows listings an administrator has created, verified and published — no listings, facilities, photos or reviews are invented or pre-seeded. Real, verified listings must be added through `/facilities`.
- **No dedicated services, photos or ratings columns.** The current schema stores a summary, a full description (where services can be described in text), contact details, a map link and external review links. Structured service tags, photo galleries or on-site ratings would require a deliberate future schema change — by design, SAHAYAK does not host ratings or reviews.
- **Demo resident records are synthetic.** The 8 "Demo Resident" rows exist only for demonstration and contain no real personal or medical information.
- **Manual database setup.** Schema scripts are applied by hand in the Supabase SQL Editor (see above) — there is no automated migration command.
- **Not a medical device.** SAHAYAK organizes information; it does not diagnose, prescribe or replace healthcare professionals.

---

## 🎨 Design Philosophy

SAHAYAK is designed to feel like a modern, trustworthy digital platform rather than a traditional college CRUD application — calm, human-centered, and accessible to users with limited technical experience.

- **Simple** — Easy for users with limited technical experience
- **Clear** — Important information should be easy to find
- **Accessible** — Designed for different screen sizes and accessibility needs
- **Calm** — Avoid unnecessary visual complexity
- **Consistent** — Shared components and design patterns throughout the application
- **Human-centered** — Technology should support caregivers rather than replace human care

---

## 👥 Target Users

- **Administrators** — manage residents, staff accounts and the public directory listings
- **Care staff** — access resident information and record health observations
- **Family members** — a private, read-only window into their loved one's updates
- **The public** — discover and compare verified elderly-care homes at `/homes`

---

## 🏗️ High-Level Architecture

```text
                         SAHAYAK
                             │
                    ┌────────┴────────┐
                    │                 │
              Public Website     Authenticated App
              /homes, /register   /dashboard, /residents…
                    │                 │
                    │        ┌────────┴────────┐
                    │        │                 │
                    │   Administrator      Care Staff
                    │        │            (Family → /family)
                    └────────┴─────────────────┘
                             │
                          Supabase
                             │
                   ┌─────────┴─────────┐
                   │                   │
              PostgreSQL          Authentication
              + Row Level Security     │
                   │
              Application Data
              (facilities, residents,
               observations, …)
```

---

_A Community Engagement Program project — Department of Computer Engineering, Government College of Engineering, Nagpur._
