import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
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
  useCareSettings,
  useCreateAppointment,
  useUpdateAppointment,
  type Appointment,
} from "@/features/care/queries";
import {
  DEFAULT_OBSERVATION_INTERVAL_DAYS,
  addDays,
  toDateOnly,
  toInputValue,
  today,
} from "@/lib/appointments";

/**
 * Marks an observation as completed: records what was observed and opens the
 * next observation in the cycle so no resident silently falls off the list.
 */
export function CompleteObservationDialog({
  appointment,
  residentName,
}: {
  appointment: Appointment;
  residentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [doctor, setDoctor] = useState("");
  const [nextDueOn, setNextDueOn] = useState("");
  const { data: settings } = useCareSettings();
  const interval = settings?.observation_interval_days ?? DEFAULT_OBSERVATION_INTERVAL_DAYS;
  const update = useUpdateAppointment();
  const create = useCreateAppointment();
  const pending = update.isPending || create.isPending;

  useEffect(() => {
    if (!open) return;
    setNotes(appointment.notes ?? "");
    setDoctor(appointment.doctor_name ?? "");
    const base = today();
    setNextDueOn(appointment.next_due_on ?? toInputValue(addDays(base, interval)));
  }, [open, appointment, interval]);

  const submit = async () => {
    try {
      await update.mutateAsync({
        id: appointment.id,
        values: {
          status: "completed",
          notes: notes.trim() || null,
          doctor_name: doctor.trim() || null,
          next_due_on: nextDueOn || null,
        },
      });
      if (nextDueOn) {
        await create.mutateAsync({
          resident_id: appointment.resident_id,
          scheduled_on: nextDueOn,
          next_due_on: toInputValue(addDays(toDateOnly(nextDueOn), interval)),
          doctor_name: doctor.trim() || null,
          reason: appointment.reason,
          status: "upcoming",
        });
      }
      toast.success(
        nextDueOn
          ? "Observation recorded and the next one scheduled."
          : "Observation recorded.",
      );
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not record the observation.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <CheckCircle2 className="size-4" />
          Complete
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record observation — {residentName}</DialogTitle>
          <DialogDescription>
            Write down what was observed, then confirm when the next observation is due. Clear the
            date if no follow-up is needed.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="done-doctor">Doctor or medical professional</Label>
            <Input
              id="done-doctor"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              placeholder="Who saw the resident"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="done-notes">Observation notes</Label>
            <Textarea
              id="done-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Findings, advice given, changes to care…"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="done-next">Next observation date</Label>
            <Input
              id="done-next"
              type="date"
              value={nextDueOn}
              onChange={(e) => setNextDueOn(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Suggested {interval} days from today, following the facility's observation cycle.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? "Saving…" : "Save & schedule next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
