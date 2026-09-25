import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  donationTypeLabels,
  useReviewDonation,
  useUpdateDonation,
  type Donation,
} from "@/features/donations/queries";

/** Staff review of one donation offer: fix details, then accept, mark received or decline. */
export function DonationReviewDialog({ donation }: { donation: Donation }) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(donation.description ?? "");
  const [amount, setAmount] = useState(donation.amount != null ? String(donation.amount) : "");
  const [note, setNote] = useState(donation.staff_note ?? "");

  const update = useUpdateDonation();
  const review = useReviewDonation();
  const busy = update.isPending || review.isPending;
  const closed = donation.status === "received" || donation.status === "declined";

  async function saveEdits() {
    await update.mutateAsync({
      id: donation.id,
      values: {
        description: description.trim() || null,
        amount: amount ? Number(amount) : null,
      },
    });
  }

  async function decide(status: Donation["status"], message: string) {
    try {
      if (!closed) await saveEdits();
      await review.mutateAsync({ id: donation.id, status, note });
      toast.success(message);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update this donation");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={closed ? "ghost" : "outline"} size="sm">
          {closed ? "View" : "Review"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Donation {donation.reference}</DialogTitle>
          <DialogDescription>
            {donationTypeLabels[donation.donation_type]} offered{" "}
            {new Date(donation.created_at).toLocaleString()} — status {donation.status}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="d-description">What is being given</Label>
            <Textarea
              id="d-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              disabled={closed}
            />
          </div>

          {donation.donation_type === "financial" && (
            <div className="space-y-2">
              <Label htmlFor="d-amount">Amount (₹)</Label>
              <Input
                id="d-amount"
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={closed}
              />
            </div>
          )}

          <dl className="surface-card space-y-2 p-4 text-sm">
            <Row label="Donor">{donation.donor_name}</Row>
            <Row label="Phone">{donation.donor_phone}</Row>
            {donation.donor_email && <Row label="Email">{donation.donor_email}</Row>}
            {donation.donor_address && <Row label="Address">{donation.donor_address}</Row>}
            {donation.preferred_date && (
              <Row label="Preferred date">
                {new Date(donation.preferred_date).toLocaleDateString()}
              </Row>
            )}
          </dl>

          <div className="space-y-2">
            <Label htmlFor="d-note">Internal note</Label>
            <Textarea
              id="d-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={500}
              disabled={closed}
              placeholder="e.g. Collected by Sunita on Friday morning"
            />
          </div>
        </div>

        <DialogFooter className="flex-wrap gap-2">
          {closed ? (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => void decide("declined", "Donation declined")}
                disabled={busy}
              >
                Decline
              </Button>
              {donation.status === "pending" && (
                <Button
                  variant="secondary"
                  onClick={() => void decide("accepted", "Donation accepted")}
                  disabled={busy}
                >
                  Accept
                </Button>
              )}
              <Button
                onClick={() => void decide("received", "Donation marked as received")}
                disabled={busy}
              >
                {busy && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
                Mark received
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-32 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="whitespace-pre-wrap">{children}</dd>
    </div>
  );
}
