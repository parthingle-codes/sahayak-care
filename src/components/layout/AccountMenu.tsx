import { Link } from "@tanstack/react-router";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

/** Signed-in staff account menu: identity, role badge and sign out. */
export function AccountMenu() {
  const { user, profile, role, signOut } = useAuth();
  const name = profile?.full_name?.trim() || user?.email || "Staff member";
  const initials = name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex items-center gap-3">
      <span className="hidden items-center gap-1.5 rounded-full bg-done-soft px-3 py-1.5 text-xs font-semibold text-done-foreground ring-1 ring-inset ring-done/25 sm:inline-flex">
        <span className="size-1.5 rounded-full bg-done" aria-hidden />
        {role === "admin" ? "Administrator access" : "Caregiver access"}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-11 gap-2.5 rounded-full px-2 pr-2.5"
            aria-label="Account menu"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-[image:var(--gradient-brand)] text-sm font-semibold text-primary-foreground ring-2 ring-white/70">
              {initials || <UserRound className="size-4" aria-hidden />}
            </span>
            <span className="hidden text-left md:inline-flex md:flex-col md:leading-tight">
              <span className="max-w-[140px] truncate text-sm font-semibold">{name}</span>
              <span className="text-[11px] font-normal text-muted-foreground">Care team</span>
            </span>
            <ChevronDown className="hidden size-4 text-muted-foreground md:block" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="space-y-0.5">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="truncate text-xs font-normal text-muted-foreground">{user?.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/settings" className="flex items-center gap-2">
              <Settings className="size-4" aria-hidden />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void signOut()} className="gap-2">
            <LogOut className="size-4" aria-hidden />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
