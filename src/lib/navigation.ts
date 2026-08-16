import {
  LayoutDashboard,
  Users,
  HeartPulse,
  Pill,
  CalendarClock,
  BedDouble,
  FileBarChart,
  Settings,
  type LucideIcon,
} from "lucide-react";

/** Roles used across the app. Version 1 has exactly two. */
export type Role = "admin" | "caregiver";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  roles: Role[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, roles: ["admin", "caregiver"] },
    ],
  },
  {
    label: "People",
    items: [{ label: "Residents", to: "/residents", icon: Users, roles: ["admin", "caregiver"] }],
  },
  {
    label: "Care & Health",
    items: [
      {
        label: "Health Records",
        to: "/health-records",
        icon: HeartPulse,
        roles: ["admin", "caregiver"],
      },
      { label: "Medicines", to: "/medicines", icon: Pill, roles: ["admin", "caregiver"] },
      {
        label: "Appointments",
        to: "/appointments",
        icon: CalendarClock,
        roles: ["admin", "caregiver"],
      },
    ],
  },
  {
    label: "Facility",
    items: [{ label: "Rooms & Beds", to: "/rooms", icon: BedDouble, roles: ["admin"] }],
  },
  {
    label: "Insights",
    items: [{ label: "Reports", to: "/reports", icon: FileBarChart, roles: ["admin"] }],
  },
  {
    label: "Account",
    items: [
      { label: "Settings", to: "/settings", icon: Settings, roles: ["admin", "caregiver"] },
    ],
  },
];

export function navGroupsForRole(role: Role): NavGroup[] {
  return navGroups
    .map((group) => ({ ...group, items: group.items.filter((i) => i.roles.includes(role)) }))
    .filter((group) => group.items.length > 0);
}
