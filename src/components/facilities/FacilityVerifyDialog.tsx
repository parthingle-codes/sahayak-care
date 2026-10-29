import { useEffect, useState } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  facilityErrorMessage,
  useSetFacilityVerification,
  type FacilityWithAudit,
} from "@/features/directory/queries";

/**
 * Records (or removes) a verification through set_facility_verification —
 * the only path that writes the verification column and its audit evidence.
 * A non-empty note is required to verify; it stays internal.
 */
export function FacilityVerifyDialog({
  facility,
  open,
  onOpenChange,
}: {
  facility: FacilityWithAudit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isVerified = facility?.verification === "verified";
  const setVerification = useSetFacilityVerification();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNote("");
      setError(null);
    }
  }, [open]);

  if (!facility) return null;

  const submit = async () => {
    if (isVerified) {
      try {
        await setVerification.mutateAsync({ id: facility.id, verification: "unverified" });
        toast.success("Verification removed. Unpublish the listing if it is public.");
        onOpenChange(false);
      } catch (e) {
        toast.error(facilityErrorMessage(e));
      }
      return;
    }
    if (!note.trim()) {
      setError("Add a short note describing what you verified.");
      return;
    }
    try {
      await setVerification.mutateAsync({
        id: facility.id,
        verification: "verified",
        note: note.trim(),
      });
      toast.success("Listing verified. Publish it to make it public.");
      onOpenChange(false);
    } catch (e) {
      toast.error(facilityErrorMessage(e));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isVerified ? (
              <>
                <ShieldOff className="size-5 text-alert" aria-hidden /> Remove verification
              </>
            ) : (
              <>
                <ShieldCheck className="size-5 text-primary" aria-hidden /> Verify listing
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isVerified
              ? `“${facility.name}” will lose its verified badge. If it is published, unpublish it first.`
              : `Confirm you checked the details of “${facility.name}” (call, visit, official documents). The note stays internal — visitors only see a verified badge.`}
          </DialogDescription>
        </DialogHeader>

        {!isVerified ? (
          <div className="grid gap-2">
            <Label htmlFor="verify-note">Verification note *</Label>
            <Textarea
              id="verify-note"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (e.target.value.trim()) setError(null);
              }}
              rows={3}
              placeholder="e.g. Called the home on [date] — number and address confirmed with the warden."
            />
            {error ? <p className="text-sm font-medium text-alert">{error}</p> : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={setVerification.isPending}>
            {setVerification.isPending
              ? "Saving…"
              : isVerified
                ? "Remove verification"
                : "Mark verified"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
