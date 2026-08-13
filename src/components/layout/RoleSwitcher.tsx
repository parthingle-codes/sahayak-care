import { UserRound } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole } from "@/hooks/use-role";
import type { Role } from "@/lib/navigation";

/**
 * Temporary role preview control for the shell milestone. Milestone 2 replaces
 * it with the signed-in staff member's account menu and sign-out action.
 */
export function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <div className="flex items-center gap-2">
      <UserRound className="size-4 text-muted-foreground" aria-hidden />
      <label htmlFor="role-preview" className="sr-only">
        Preview role
      </label>
      <Select value={role} onValueChange={(v) => setRole(v as Role)}>
        <SelectTrigger id="role-preview" className="h-9 w-[168px]">
          <SelectValue>{role === "admin" ? "Administrator" : "Caregiver"}</SelectValue>
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="admin">Administrator</SelectItem>
          <SelectItem value="caregiver">Caregiver</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
