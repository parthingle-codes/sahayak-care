import { useState } from "react";
import { Eye, EyeOff, MoreHorizontal, Pencil, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  facilityErrorMessage,
  useDeleteFacility,
  useUpdateFacility,
  type FacilityWithAudit,
} from "@/features/directory/queries";

/**
 * Row menu for one listing: edit, verify/unverify (opens the page dialogs),
 * publish/unpublish (direct status update — the database refuses to publish
 * an unverified listing) and delete with confirmation.
 */
export function FacilityRowActions({
  facility,
  onEdit,
  onVerify,
}: {
  facility: FacilityWithAudit;
  onEdit: () => void;
  onVerify: () => void;
}) {
  const update = useUpdateFacility();
  const remove = useDeleteFacility();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isVerified = facility.verification === "verified";
  const isPublished = facility.status === "published";

  const setStatus = async (status: "draft" | "published") => {
    try {
      await update.mutateAsync({ id: facility.id, values: { status } });
      toast.success(
        status === "published"
          ? "Listing published to the public directory."
          : "Listing unpublished — it is now a private draft.",
      );
    } catch (e) {
      toast.error(facilityErrorMessage(e));
    }
  };

  const doDelete = async () => {
    try {
      await remove.mutateAsync(facility.id);
      toast.success("Listing deleted.");
    } catch (e) {
      toast.error(facilityErrorMessage(e));
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${facility.name}`}>
            <MoreHorizontal className="size-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onSelect={onEdit}>
            <Pencil className="size-4" aria-hidden /> Edit listing
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onVerify}>
            {isVerified ? (
              <>
                <ShieldOff className="size-4" aria-hidden /> Remove verification
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" aria-hidden /> Verify listing…
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isPublished ? (
            <DropdownMenuItem onSelect={() => void setStatus("draft")}>
              <EyeOff className="size-4" aria-hidden /> Unpublish
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              disabled={!isVerified}
              title={isVerified ? undefined : "Verify the listing before publishing"}
              onSelect={() => void setStatus("published")}
            >
              <Eye className="size-4" aria-hidden /> Publish
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setConfirmDelete(true)}
          >
            <Trash2 className="size-4" aria-hidden /> Delete listing…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{facility.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The listing and its verification record will be permanently removed from the public
              directory. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={async () => {
                await doDelete();
                setConfirmDelete(false);
              }}
            >
              {remove.isPending ? "Deleting…" : "Delete listing"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
