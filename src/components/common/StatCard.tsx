import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "default" | "due" | "done" | "alert" | "info";

const toneStyles: Record<Tone, string> = {
  default: "bg-primary-soft text-primary",
  due: "bg-due-soft text-due-foreground",
  done: "bg-done-soft text-done-foreground",
  alert: "bg-alert-soft text-alert-foreground",
  info: "bg-info-soft text-info-foreground",
};

const barStyles: Record<Tone, string> = {
  default: "bg-primary",
  due: "bg-due",
  done: "bg-done",
  alert: "bg-alert",
  info: "bg-info",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <div className="surface-card group relative overflow-hidden p-5 transition-shadow hover:shadow-[var(--shadow-lift)]">
      <span className={cn("absolute inset-x-0 top-0 h-1", barStyles[tone])} aria-hidden />
      <div className="flex items-center justify-between gap-3">
        <p className="text-eyebrow">{label}</p>
        <span
          className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", toneStyles[tone])}
        >
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <p className="mt-2 font-display text-3xl font-semibold leading-none tabular-nums">{value}</p>
      {hint ? <p className="mt-2 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
