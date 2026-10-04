# SAHAAYAK

### Smart Elderly Care & Health Management Platform

> **Building Technology with Compassion.**

SAHAAYAK is a modern web-based elderly care management platform designed to help care homes organize essential resident information and day-to-day caregiving activities through a centralized, easy-to-use interface.

The project was developed as part of the **Community Engagement Program (CEP)** at **Government College of Engineering, Nagpur (GCOEN)**, with the objective of exploring how thoughtful technology can simplify elderly-care management and improve access to important information.

---

## 🌿 About the Project

During our Community Engagement Program, our team visited an elderly care facility to understand the environment in which elderly residents and caregivers operate.

The facility had approximately **15–20 residents**, a relatively small campus, shared accommodation, and residents requiring varying levels of care. During our interaction, the management also expressed a need for better use of technology.

These observations inspired us to develop SAHAAYAK.

Instead of attempting to build a large hospital-management system, SAHAAYAK focuses on the practical needs of a **small elderly-care facility**, with an emphasis on simplicity, accessibility, organization, and ease of use.

---

## 🎯 Objectives

SAHAAYAK aims to:

- Centralize resident information
- Simplify health-record management
- Organize medical observations and appointments
- Help caregivers quickly access important resident information
- Provide a clear overview of daily care priorities
- Improve information accessibility
- Reduce dependence on scattered/manual record keeping
- Provide families with an easier way to stay informed where applicable

The goal is not to replace healthcare professionals, but to provide a reliable digital platform for **care management and information organization**.

---

## 👥 Target Users

### Administrator

Administrators can manage the overall system, including resident information and operational records.

### Care Staff

Care staff can access resident information and record relevant health and care observations.

### Family Members

Family members can access the information made available to them through the family interface.

### Facilities

The platform can provide a structured digital entry point for elderly-care facilities interested in organizing their operations.

---

## ✨ Key Features

### 🏠 Dashboard

A centralized overview designed around:

> **"What needs attention today?"**

The dashboard provides quick visibility into important information such as:

- Active residents
- Upcoming medical observations
- Overdue observations
- Recent health observations
- Other relevant system information

---

### 👤 Resident Management

Manage and organize resident profiles containing essential information such as:

- Personal details
- Admission information
- Health information
- Medical history
- Care notes
- Emergency/family information where applicable

Each resident has a dedicated profile for easier access to their information.

---

### ❤️ Health Records

Maintain organized records of resident health observations and vital information.

The system is designed to make historical information easier to review while keeping resident records associated with the correct individual.

---

### 📅 Medical Appointments & Observations

SAHAAYAK supports a recurring medical observation workflow.

The facility follows a **14-day medical observation cycle**, allowing staff to keep track of:

- Upcoming observations
- Overdue observations
- Completed observations
- Missed observations
- Observation history

The appointment interface prioritizes residents according to their medical observation dates so that staff can quickly identify who requires attention next.

---

### 👨‍👩‍👧 Family Access

The platform provides a dedicated family-facing experience where appropriate information can be made available to authorized family members.

The goal is to improve information accessibility while maintaining appropriate privacy and access controls.

---

### 📝 Registration

Provides a structured interface for registering resident information and initiating the resident management workflow.

---

### 🤝 Donation Support

A dedicated section provides a way to present opportunities for supporting elderly-care initiatives.

---

### ⚙️ Settings

Provides access to relevant application and user settings while maintaining role-based access.

---

## 🎨 Design Philosophy

SAHAAYAK is designed to feel like a modern, trustworthy digital platform rather than a traditional college CRUD application.

The interface takes inspiration from modern SaaS products while maintaining a calm and human-centered healthcare aesthetic.

### Design Principles

- **Simple** — Easy for users with limited technical experience
- **Clear** — Important information should be easy to find
- **Accessible** — Designed for different screen sizes and accessibility needs
- **Calm** — Avoid unnecessary visual complexity
- **Consistent** — Shared components and design patterns throughout the application
- **Human-centered** — Technology should support caregivers rather than replace human care

---

## 🛠️ Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Lucide Icons

### Backend & Data

- Supabase
- PostgreSQL
- Supabase Authentication
- Row Level Security

### Development & Collaboration

- Git
- GitHub
- VS Code / modern web development tools

---

## 🏗️ High-Level Architecture

```text
                         SAHAAYAK
                             │
                    ┌────────┴────────┐
                    │                 │
              Public Website     Authenticated App
                    │                 │
                    │        ┌────────┴────────┐
                    │        │                 │
                    │   Administrator      Care Staff
                    │        │                 │
                    └────────┴─────────────────┘
                             │
                          Supabase
                             │
                   ┌─────────┴─────────┐
                   │                   │
              PostgreSQL          Authentication
                   │
              Application Data
