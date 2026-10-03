import { Link } from "@tanstack/react-router";
import { LogOut, Settings, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
    <div className="flex items-center gap-2">
      <Badge
        variant="secondary"
        className="hidden rounded-full border border-primary/15 bg-primary-soft text-primary sm:inline-flex"
      >
        {role === "admin" ? "Administrator" : "Caregiver"}
      </Badge>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-10 gap-2 rounded-full px-1.5 pr-3" aria-label="Account menu">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground ring-2 ring-primary-soft">
              {initials || <UserRound className="size-4" aria-hidden />}
            </span>
            <span className="hidden max-w-[140px] truncate text-sm font-medium md:inline">
              {name}
            </span>
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
