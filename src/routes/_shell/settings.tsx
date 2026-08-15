import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSetStaffRole, useStaff } from "@/features/care/queries";
import { useAuth } from "@/hooks/use-auth";
import type { Role } from "@/lib/navigation";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SAHAAYAK Elderly Care" },
      {
        name: "description",
        content: "Manage staff accounts, roles and your own profile in the care platform.",
      },
      { property: "og:title", content: "Settings — SAHAAYAK Elderly Care" },
      { property: "og:description", content: "Staff accounts, roles and personal profile." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { isAdmin, user } = useAuth();
  const { data: staff = [], isLoading } = useStaff(isAdmin);
  const setRole = useSetStaffRole();

  const change = async (userId: string, role: Role) => {
    try {
      await setRole.mutateAsync({ userId, role });
      toast.success(role === "admin" ? "Promoted to administrator." : "Set as caregiver.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not change the role.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description={
          isAdmin
            ? "Staff accounts and role assignment. Caregivers and admins can both add residents and record care."
            : "Your profile and personal preferences."
        }
      />

      {!isAdmin ? (
        <EmptyState
          icon={SettingsIcon}
          title="Managed by your administrator"
          description="Staff accounts and roles are managed by the care home administrator."
        />
      ) : isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <div className="surface-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((s) => (
                <TableRow key={s.user_id}>
                  <TableCell className="font-medium">
                    {s.full_name || "—"}
                    {s.user_id === user?.id ? (
                      <Badge variant="outline" className="ml-2">
                        You
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.email}</TableCell>
                  <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Select
                      value={s.role ?? "caregiver"}
                      onValueChange={(v) => void change(s.user_id, v as Role)}
                      disabled={setRole.isPending || s.user_id === user?.id}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="caregiver">Caregiver</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
