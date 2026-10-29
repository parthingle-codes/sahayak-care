import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "default" | "due" | "done" | "alert" | "info";

/** Soft tinted tile behind the icon. */
const toneStyles: Record<Tone, string> = {
  default: "bg-primary-soft text-primary",
  due: "bg-due-soft text-due-foreground",
  done: "bg-done-soft text-done-foreground",
  alert: "bg-alert-soft text-alert-foreground",
  info: "bg-info-soft text-info-foreground",
};

/** Bottom accent hairline — a restrained per-metric cue. */
const accentStyles: Record<Tone, string> = {
  default: "bg-primary",
  due: "bg-due",
  done: "bg-done",
  alert: "bg-alert",
  info: "bg-info",
};

const dotStyles: Record<Tone, string> = {
  default: "bg-primary",
  due: "bg-due",
  done: "bg-done",
  alert: "bg-alert",
  info: "bg-info",
};

export function StatCard({
  label,
  value,
  subtext,
  subtextAlert = false,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  /** Small grey line set beside the number (e.g. "currently staying"). */
  subtext?: string;
  /** Render the subtext in the tone's attention colour (e.g. "needs attention"). */
  subtextAlert?: boolean;
  hint?: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <div className="surface-card group relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-eyebrow pt-1">{label}</p>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-white/70",
            toneStyles[tone],
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <p className="font-display text-3xl font-semibold leading-none tracking-tight tabular-nums">
          {value}
        </p>
        {subtext ? (
          <span
            className={cn(
              "text-sm",
              subtextAlert ? "font-medium text-alert-foreground" : "text-muted-foreground",
            )}
          >
            {subtext}
          </span>
        ) : null}
      </div>
      {hint ? (
        <p className="mt-3 flex items-center gap-2 text-[13px] text-muted-foreground">
          <span className={cn("size-1.5 shrink-0 rounded-full", dotStyles[tone])} aria-hidden />
          {hint}
        </p>
      ) : null}
      <span
        className={cn(
          "absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r to-transparent",
          accentStyles[tone],
        )}
        aria-hidden
      />
    </div>
  );
}
