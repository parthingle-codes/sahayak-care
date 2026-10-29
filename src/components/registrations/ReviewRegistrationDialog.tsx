import { useState } from "react";
import { Loader2, FlaskConical, ShieldCheck } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useApproveRegistration,
  useRejectRegistration,
  useUpdateRegistration,
  useSimulateDemoVerification,
  type Registration,
} from "@/features/registrations/queries";

/**
 * Staff review of one online admission request: fix typos, then approve
 * (creates the resident) or reject with a reason.
 */
export function ReviewRegistrationDialog({ registration }: { registration: Registration }) {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState(registration.full_name);
  const [gender, setGender] = useState(registration.gender ?? "");
  const [dob, setDob] = useState(registration.date_of_birth ?? "");
  const [mobility, setMobility] = useState(registration.mobility);
  const [admission, setAdmission] = useState(registration.preferred_admission_date ?? "");
  const [note, setNote] = useState("");

  const update = useUpdateRegistration();
  const approve = useApproveRegistration();
  const reject = useRejectRegistration();
  const simulateDemo = useSimulateDemoVerification();
  const busy = update.isPending || approve.isPending || reject.isPending || simulateDemo.isPending;
  const decided = registration.status !== "pending";
  const [confirmDemo, setConfirmDemo] = useState(false);

  async function handleApprove() {
    try {
      await update.mutateAsync({
        id: registration.id,
        values: {
          full_name: fullName.trim(),
          gender: (gender || null) as never,
          date_of_birth: dob || null,
          mobility: mobility as never,
          preferred_admission_date: admission || null,
        },
      });
      await approve.mutateAsync(registration.id);
      toast.success(`${fullName.trim()} added to residents`);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not approve this request");
    }
  }

  async function handleReject() {
    try {
      await reject.mutateAsync({ id: registration.id, note: note.trim() });
      toast.success("Registration rejected");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reject this request");
    }
  }

  async function handleSimulateDemo() {
    try {
      await simulateDemo.mutateAsync(registration.id);
      toast.success("Demo simulation recorded — no real identity check was performed.");
      setConfirmDemo(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not simulate the demo flow.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={decided ? "ghost" : "outline"} size="sm">
          {decided ? "View" : "Review"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registration {registration.reference}</DialogTitle>
          <DialogDescription>
            Submitted {new Date(registration.created_at).toLocaleString()} — status{" "}
            {registration.status}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="r-name">Resident name</Label>
              <Input
                id="r-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={decided}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-gender">Gender</Label>
              <Select value={gender} onValueChange={setGender} disabled={decided}>
                <SelectTrigger id="r-gender">
                  <SelectValue placeholder="Not given" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-dob">Date of birth</Label>
              <Input
                id="r-dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                disabled={decided}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-mobility">Mobility</Label>
              <Select
                value={mobility}
                onValueChange={(v) => setMobility(v as typeof mobility)}
                disabled={decided}
              >
                <SelectTrigger id="r-mobility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent">Independent</SelectItem>
                  <SelectItem value="walker">Uses walker</SelectItem>
                  <SelectItem value="wheelchair">Wheelchair</SelectItem>
                  <SelectItem value="bedridden">Bedridden</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-admission">Admission date</Label>
              <Input
                id="r-admission"
                type="date"
                value={admission}
                onChange={(e) => setAdmission(e.target.value)}
                disabled={decided}
              />
            </div>
          </div>

          <dl className="surface-card space-y-2 p-4 text-sm">
            <Row label="Contact">
              {registration.contact_name}
              {registration.contact_relationship ? ` (${registration.contact_relationship})` : ""}
            </Row>
            <Row label="Phone">{registration.contact_phone}</Row>
            {registration.contact_email && <Row label="Email">{registration.contact_email}</Row>}
            {registration.contact_address && (
              <Row label="Address">{registration.contact_address}</Row>
            )}
            {registration.known_conditions && (
              <Row label="Known conditions">{registration.known_conditions}</Row>
            )}
            {registration.current_medicines && (
              <Row label="Medicines">{registration.current_medicines}</Row>
            )}
            {registration.resident_notes && <Row label="Notes">{registration.resident_notes}</Row>}
            {registration.review_note && <Row label="Review note">{registration.review_note}</Row>}
          </dl>

          {/* ── DigiLocker DEMO MODE panel ── */}
          <div
            role="note"
            aria-label="DigiLocker demo mode status"
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/40"
          >
            <div className="flex items-start gap-3">
              <FlaskConical
                className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden
              />
              <div className="flex-1 space-y-2 text-sm text-amber-900 dark:text-amber-200">
                <p>
                  <strong>DigiLocker DEMO MODE</strong> — Does not perform real Aadhaar or
                  DigiLocker identity verification.
                </p>
                {registration.digilocker_status === "demo_completed" ? (
                  <div className="flex items-center gap-2 font-semibold">
                    <ShieldCheck
                      className="size-4 text-amber-700 dark:text-amber-300"
                      aria-hidden
                    />
                    DEMO COMPLETED — NOT IDENTITY VERIFIED
                  </div>
                ) : !decided ? (
                  confirmDemo ? (
                    <div className="space-y-2">
                      <p className="font-medium">
                        Confirm: this will mark the demo as run. No real verification will occur.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmDemo(false)}
                          disabled={busy}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={() => void handleSimulateDemo()} disabled={busy}>
                          {simulateDemo.isPending && (
                            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                          )}
                          Confirm demo
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmDemo(true)}
                      disabled={busy}
                    >
                      <FlaskConical className="mr-2 size-4" aria-hidden />
                      Simulate Demo Flow
                    </Button>
                  )
                ) : (
                  <p className="text-muted-foreground">
                    Demo status: <span className="font-mono">{registration.digilocker_status}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {!decided && (
            <div className="space-y-2">
              <Label htmlFor="r-note">Reason, if rejecting</Label>
              <Textarea
                id="r-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="e.g. No bed available this month"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          {decided ? (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => void handleReject()} disabled={busy}>
                Reject
              </Button>
              <Button onClick={() => void handleApprove()} disabled={busy || !fullName.trim()}>
                {busy && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
                Approve &amp; add resident
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
