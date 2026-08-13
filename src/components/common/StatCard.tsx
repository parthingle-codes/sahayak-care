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
    <div className="surface-card flex items-start gap-4 p-5">
      <span
        className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg", toneStyles[tone])}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-eyebrow">{label}</p>
        <p className="font-display text-2xl font-semibold leading-tight">{value}</p>
        {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}
