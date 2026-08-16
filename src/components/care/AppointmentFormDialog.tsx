import { useEffect, useState } from "react";
import { CalendarClock, Pencil } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCareSettings,
  useCreateAppointment,
  useResidents,
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

type Status = Appointment["status"];

/**
 * Schedules a medical observation for a resident, or edits an existing one.
 * The next observation date is pre-filled from the facility's cycle length and
 * stays editable, so the interval is never fixed in code.
 */
export function AppointmentFormDialog({
  record,
  residentId,
}: {
  record?: Appointment;
  residentId?: string;
}) {
  const isEdit = Boolean(record);
  const [open, setOpen] = useState(false);
  const [resident, setResident] = useState(residentId ?? "");
  const [scheduledOn, setScheduledOn] = useState(toInputValue(today()));
  const [nextDueOn, setNextDueOn] = useState("");
  const [doctor, setDoctor] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("upcoming");

  const { data: residents = [], isLoading } = useResidents();
  const { data: settings } = useCareSettings();
  const interval = settings?.observation_interval_days ?? DEFAULT_OBSERVATION_INTERVAL_DAYS;
  const create = useCreateAppointment();
  const update = useUpdateAppointment();
  const pending = create.isPending || update.isPending;

  useEffect(() => {
    if (!open) return;
    const start = record ? toDateOnly(record.scheduled_on) : today();
    setResident(record?.resident_id ?? residentId ?? "");
    setScheduledOn(toInputValue(start));
    setNextDueOn(record?.next_due_on ?? toInputValue(addDays(start, interval)));
    setDoctor(record?.doctor_name ?? "");
    setReason(record?.reason ?? "");
    setNotes(record?.notes ?? "");
    setStatus(record?.status ?? "upcoming");
  }, [open, record, residentId, interval]);

  const submit = async () => {
    if (!resident) {
      toast.error("Choose the resident this observation is for.");
      return;
    }
    const values = {
      resident_id: resident,
      scheduled_on: scheduledOn,
      next_due_on: nextDueOn || null,
      doctor_name: doctor.trim() || null,
      reason: reason.trim() || null,
      notes: notes.trim() || null,
      status,
    };
    try {
      if (record) {
        await update.mutateAsync({ id: record.id, values });
        toast.success("Appointment updated.");
      } else {
        await create.mutateAsync(values);
        toast.success("Appointment scheduled.");
      }
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the appointment.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="sm">
            <Pencil className="size-4" />
            Edit
          </Button>
        ) : (
          <Button>
            <CalendarClock className="size-4" />
            Schedule observation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit appointment" : "Schedule medical observation"}</DialogTitle>
          <DialogDescription>
            The next observation date is suggested {interval} days ahead. Change it whenever the
            resident needs an earlier or later check.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Resident</Label>
            <Select value={resident} onValueChange={setResident}>
              <SelectTrigger>
                <SelectValue placeholder="Select a resident" />
              </SelectTrigger>
              <SelectContent>
                {residents.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.full_name}
                    {r.room_label ? ` · ${r.room_label}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isLoading && residents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No residents yet — add a resident on the Residents page first.
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="appt-on">Observation date</Label>
              <Input
                id="appt-on"
                type="date"
                value={scheduledOn}
                onChange={(e) => {
                  setScheduledOn(e.target.value);
                  if (e.target.value) {
                    setNextDueOn(toInputValue(addDays(toDateOnly(e.target.value), interval)));
                  }
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="appt-next">Next observation date</Label>
              <Input
                id="appt-next"
                type="date"
                value={nextDueOn}
                onChange={(e) => setNextDueOn(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="appt-doctor">Doctor or medical professional</Label>
            <Input
              id="appt-doctor"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              placeholder="Dr. Kulkarni — visiting physician"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="appt-reason">Reason or purpose</Label>
            <Input
              id="appt-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Routine 14-day check, BP review, follow-up…"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="appt-status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
              <SelectTrigger id="appt-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="appt-notes">Notes / observations</Label>
            <Textarea
              id="appt-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What the doctor observed, advice given, anything the next shift should know…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? "Saving…" : isEdit ? "Save changes" : "Save appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
