import type { Appointment, Resident } from "@/features/care/queries";

export type AppointmentBucket = "overdue" | "due" | "upcoming" | "completed" | "missed";

export const DEFAULT_OBSERVATION_INTERVAL_DAYS = 14;

/** Local midnight of today, so day maths never drifts with time of day. */
export function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toDateOnly(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function toInputValue(date: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Whole days from today to the given date; negative means overdue. */
export function daysUntil(dateOnly: string) {
  const diff = toDateOnly(dateOnly).getTime() - today().getTime();
  return Math.round(diff / 86_400_000);
}

export function formatDate(dateOnly: string) {
  return toDateOnly(dateOnly).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  });
}

export function daysRemainingLabel(dateOnly: string) {
  const days = daysUntil(dateOnly);
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 0) return `${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"} overdue`;
  return `${days} days`;
}

export function bucketOf(appointment: Appointment): AppointmentBucket {
  if (appointment.status === "completed") return "completed";
  if (appointment.status === "missed") return "missed";
  const days = daysUntil(appointment.scheduled_on);
  if (days < 0) return "overdue";
  if (days === 0) return "due";
  return "upcoming";
}

export const bucketTone: Record<AppointmentBucket, "alert" | "due" | "info" | "done"> = {
  overdue: "alert",
  due: "due",
  upcoming: "info",
  completed: "done",
  missed: "alert",
};

export const bucketLabel: Record<AppointmentBucket, string> = {
  overdue: "Overdue",
  due: "Due today",
  upcoming: "Upcoming",
  completed: "Completed",
  missed: "Missed",
};

export type AppointmentRow = {
  appointment: Appointment;
  resident: Resident | undefined;
  bucket: AppointmentBucket;
};

/** Soonest first; overdue naturally rises to the top of open appointments. */
export function buildRows(appointments: Appointment[], residents: Resident[]): AppointmentRow[] {
  return appointments
    .map((appointment) => ({
      appointment,
      resident: residents.find((r) => r.id === appointment.resident_id),
      bucket: bucketOf(appointment),
    }))
    .sort(
      (a, b) =>
        toDateOnly(a.appointment.scheduled_on).getTime() -
        toDateOnly(b.appointment.scheduled_on).getTime(),
    );
}
