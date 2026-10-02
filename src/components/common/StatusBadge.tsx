import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock,
  Info,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusTone = "done" | "due" | "alert" | "info" | "neutral";

const toneClass: Record<StatusTone, string> = {
  done: "bg-done-soft text-done-foreground ring-done/25",
  due: "bg-due-soft text-due-foreground ring-due/30",
  alert: "bg-alert-soft text-alert-foreground ring-alert/25",
  info: "bg-info-soft text-info-foreground ring-info/25",
  neutral: "bg-muted text-muted-foreground ring-border",
};

const toneIcon: Record<StatusTone, LucideIcon> = {
  done: CheckCircle2,
  due: Clock,
  alert: AlertTriangle,
  info: Info,
  neutral: Circle,
};

/** Maps common status words used across the app to one consistent tone. */
const statusTone: Record<string, StatusTone> = {
  completed: "done",
  done: "done",
  approved: "done",
  received: "done",
  accepted: "info",
  active: "done",
  stable: "done",
  healthy: "done",
  due: "due",
  pending: "due",
  upcoming: "info",
  scheduled: "info",
  overdue: "alert",
  missed: "alert",
  critical: "alert",
  rejected: "neutral",
  declined: "neutral",
  inactive: "neutral",
  discharged: "neutral",
  cancelled: "neutral",
};

const specialIcon: Record<string, LucideIcon> = {
  upcoming: CalendarClock,
  scheduled: CalendarClock,
  rejected: XCircle,
  declined: XCircle,
};

export function StatusBadge({
  status,
  label,
  tone,
  className,
}: {
  status: string;
  label?: string;
  tone?: StatusTone;
  className?: string;
}) {
  const key = status.toLowerCase();
  const t = tone ?? statusTone[key] ?? "neutral";
  const Icon = specialIcon[key] ?? toneIcon[t];
  const text = label ?? status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        toneClass[t],
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {text}
    </span>
  );
}
