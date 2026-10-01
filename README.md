# Care Companion Pro

SAHAAYAK — Smart Elderly Care & Health Management Platform

You are the senior product engineer, software architect, UI/UX designer, database architect, QA engineer, and technical mentor for this project.

We are a team of 3 Computer Science Engineering students from Government College of Engineering, Nagpur (GCOEN) developing this as our Community Engagement Program (CEP) project.

We want to build a real-world, professional web application, not a typical college CRUD project.

1. Project Vision

SAHAAYAK is a centralized elderly-care management platform designed primarily for small old age homes and elderly care facilities.

Tagline: Building Technology with Compassion.

The goal is to reduce paperwork, organize resident information, simplify caregiver workflows, and make important information quickly accessible.

The application should feel like a modern SaaS product while remaining extremely simple for non-technical staff.

2. What We Learned From Our Field Visit

We visited an elderly care facility and observed:

Approximately 15–20 residents

Small campus

Shared rooms with approximately 7–8 beds

Majority of residents were women

Residents used wheelchairs

Management indicated that they need technological improvements

The facility has an existing informational website

The facility appears to focus on elderly/dementia care

Important:

Do not treat assumptions as confirmed requirements. Where information is unknown, design the system flexibly and avoid inventing workflows.

The application should initially be suitable for approximately 15–50 residents but should have a database structure that can scale further.

3. Primary Users

Administrator

Can:

Manage residents

Manage caregivers

Manage rooms and beds

Manage medical information

Manage medicines

Manage appointments

Manage emergency contacts

View reports

Search and filter records

View dashboard statistics

Caregiver

Can:

View assigned residents

View resident profiles

Record daily health observations

Manage medicine administration

View appointments

Record care-related observations

Access emergency information

Residents themselves are not required to log into the system in Version 1.

4. Core Features

Prioritize features based on usefulness.

Must Have

Authentication

Role-based access

Dashboard

Resident Management

Resident Profile

Medical History

Daily Health Records

Medicine Schedule

Medicine Administration Tracking

Doctor Appointments

Emergency Contacts

Room & Bed Management

Search and Filters

Basic Reports

Should Have

Visitor Management

Notifications/reminders

Health timeline

Activity/audit log

Could Have

Only if the core system is stable:

AI-generated health summaries

OCR prescription extraction

PDF report generation

Do not add unnecessary features simply to make the project look bigger.

5. Recommended Technology Stack

Use:

Frontend

React

TypeScript

Vite

Tailwind CSS

shadcn/ui

Backend / Database

Use Supabase for:

PostgreSQL database

Authentication

Row Level Security

Backend data access

Storage where required

Use Supabase Edge Functions only when server-side logic is necessary.

Additional

React Router

TanStack Query where useful

Lucide icons

GitHub for version control

Do not introduce unnecessary technologies.

The application must remain easy for a team of 3 students to understand, maintain, demonstrate, and explain during a viva.

6. Architecture

Use a clean modular architecture.

Separate:

UI components

Pages

Business logic

Data access

Authentication

Reusable utilities

Types

Use reusable components rather than duplicating UI.

Keep the database relational and normalized.

Use proper foreign keys, constraints, timestamps, and indexes.

7. Database

Design the database around entities such as:

Users

Roles

Residents

Emergency Contacts

Rooms

Beds

Medical Records

Health Observations

Medicines

Medicine Schedules

Medicine Administration Records

Doctors

Appointments

Visitors

Reports

Audit Logs

Do not blindly create every table above.

First determine the relationships and actual requirements.

Avoid storing unnecessary sensitive information.

Use appropriate constraints and relationships.

8. Authentication & Security

Implement secure authentication.

Requirements:

Login

Logout

Role-based authorization

Admin and Caregiver roles

Row Level Security

Input validation

Protected routes

Secure handling of user data

No exposed secrets or API keys

Never place sensitive credentials directly in frontend code

Use Supabase Auth rather than creating a custom authentication system.

9. Dashboard

Create a professional dashboard that immediately communicates the current situation.

Possible information:

Total residents

Available beds

Today's medicines

Today's appointments

Pending medicine administrations

Recent health observations

Important alerts

Do not overload the dashboard with unnecessary charts.

The dashboard should help a caregiver answer:

"What needs my attention today?"

10. Resident Profile

The resident profile should be the central screen of the application.

Include:

Photo

Name

Age

Gender

Room

Bed

Admission date

Emergency contacts

Medical history

Current medicines

Appointments

Recent health observations

Care notes

Use tabs or clearly separated sections to prevent information overload.

11. Medicine Management

Create a practical medicine workflow.

The system should allow authorized users to:

Add medicines

Define dosage

Define frequency

Define scheduled times

View today's medicine schedule

Mark medicine as administered

Record missed/delayed administration where appropriate

The UI should make today's pending medicines extremely easy to identify.

12. Health Records

Allow caregivers to record appropriate observations such as:

Blood pressure

Blood sugar where applicable

Temperature

Weight

Pulse

General observation/care notes

Do not present the system as a diagnostic or medical decision-making tool.

The application is a care-management and record-keeping system, not a replacement for healthcare professionals.

13. AI

AI should be optional and meaningful.

Do not add AI simply because this is an AI-assisted development project.

Potential AI feature:

Health Summary

Generate a concise summary from existing recorded observations and medical information to help caregivers understand recent trends.

The AI must:

Use existing stored information

Clearly identify that the summary is AI-generated

Never diagnose diseases

Never recommend treatment

Never replace a doctor

Only implement AI after the core application is stable.

14. UI/UX

Create a polished modern SaaS interface inspired by:

Linear

Notion

GitHub

Stripe

Vercel

Design characteristics:

Clean

Calm

Accessible

Minimal

Professional

Responsive

Large readable text

Clear navigation

Consistent spacing

Strong visual hierarchy

Use a calm healthcare-inspired visual identity rather than an overly colorful hospital-style interface.

The application must work well on:

Desktop

Laptop

Tablet

Prioritize desktop because this is the primary demonstration environment.

15. Navigation

Use a clear sidebar navigation.

Suggested structure:

Dashboard

Residents

Care & Health

Health Records

Medicines

Appointments

Facility

Rooms & Beds

Visitors

Reports

Settings

The navigation should change appropriately according to the user's role.

16. UX Principles

A caregiver should be able to perform common tasks with very few clicks.

Examples:

Find a resident quickly.

See today's medicine schedule immediately.

Open a resident profile quickly.

Access emergency contacts immediately.

Record a health observation quickly.

Avoid complicated forms.

Use:

Search

Filters

Dropdowns

Date/time pickers

Confirmation dialogs

Empty states

Loading states

Error states

Success feedback

17. Quality Requirements

The application must have:

Responsive design

Loading states

Empty states

Error handling

Form validation

Confirmation before destructive actions

Consistent buttons and forms

Accessible labels

Proper error messages

No broken links

No placeholder content in the final version

Use realistic demo data for the elderly care environment.

Do not use real resident personal information.

18. Development Strategy

Do NOT attempt to generate the entire application in one step.

Work in milestones.

Milestone 1

Project foundation and design system.

Milestone 2

Authentication and roles.

Milestone 3

Database and Resident Management.

Milestone 4

Rooms and Beds.

Milestone 5

Medical History and Health Records.

Milestone 6

Medicine Management.

Milestone 7

Doctor Appointments and Emergency Contacts.

Milestone 8

Dashboard, Search, Filters and Reports.

Milestone 9

Visitor Management and Notifications if useful.

Milestone 10

Optional AI features.

Milestone 11

Testing, security review, UX polishing and demo preparation.

Do not move to the next major milestone until the current one works correctly.

19. Important Development Rule

Before making major architectural changes:

Explain the proposed change and why it is necessary.

Do not unnecessarily change the technology stack.

Do not introduce additional frameworks without a clear reason.

Maintain consistency across the entire application.

Do not generate disconnected components or duplicate functionality.

If an existing implementation can be improved, improve it instead of creating a parallel implementation.

20. Final Product Goal

The final application should look and behave like a real elderly-care management SaaS product.

When a faculty member opens it, they should immediately see:

A professional interface

Clear user roles

Realistic workflows

Proper database-backed functionality

Thoughtful UX

Secure authentication

Useful reports

Meaningful healthcare/care-management features

It should be simple enough for a small old age home to understand and sophisticated enough to demonstrate professional software engineering.

Start by analyzing this project and proposing the final architecture, database structure, navigation structure, and development milestones. Do not generate the complete application yet.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/833fa38b-0c57-42bc-85c9-86978d440b95).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
