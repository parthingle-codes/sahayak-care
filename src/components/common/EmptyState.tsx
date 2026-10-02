import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-primary/25 bg-card/60 px-6 py-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary ring-8 ring-primary-soft/40">
        <Icon className="size-6" aria-hidden />
      </span>
      <h2 className="mt-2 text-lg font-semibold">{title}</h2>
      {description ? (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
