import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Titled content surface: tinted icon tile, display heading, optional count
 * pill and trailing actions above a hairline divider. Used for dashboard
 * workflow panels and resident-dossier sections so every titled surface in
 * the product shares one composition.
 */
export function Panel({
  icon: Icon,
  title,
  count,
  actions,
  children,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  count?: number;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-card overflow-hidden", className)}>
      <header className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
        {Icon ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary ring-1 ring-inset ring-primary/10">
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
        <h2 className="min-w-0 font-display text-base font-semibold tracking-tight">{title}</h2>
        {typeof count === "number" ? (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
            {count}
          </span>
        ) : null}
        {actions ? <div className="ml-auto shrink-0">{actions}</div> : null}
      </header>
      <div>{children}</div>
    </section>
  );
}
