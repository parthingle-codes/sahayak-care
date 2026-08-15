import { useState } from "react";
import { HeartPulse } from "lucide-react";
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
import { useCreateObservation, useResidents } from "@/features/care/queries";

const num = (v: string) => (v.trim() === "" ? null : Number(v));
const localNow = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

/** Records one set of measured vitals. Every vital is optional on purpose. */
export function ObservationFormDialog() {
  const [open, setOpen] = useState(false);
  const [residentId, setResidentId] = useState("");
  const [recordedAt, setRecordedAt] = useState(localNow());
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [pulse, setPulse] = useState("");
  const [temp, setTemp] = useState("");
  const [sugar, setSugar] = useState("");
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const { data: residents = [], isLoading } = useResidents();
  const create = useCreateObservation();

  const submit = async () => {
    if (!residentId) {
      toast.error("Choose the resident these readings belong to.");
      return;
    }
    try {
      await create.mutateAsync({
        resident_id: residentId,
        recorded_at: new Date(recordedAt).toISOString(),
        bp_systolic: num(sys),
        bp_diastolic: num(dia),
        pulse: num(pulse),
        temperature_c: num(temp),
        blood_sugar: num(sugar),
        weight_kg: num(weight),
        note: note.trim() || null,
      });
      toast.success("Observation recorded.");
      setSys("");
      setDia("");
      setPulse("");
      setTemp("");
      setSugar("");
      setWeight("");
      setNote("");
      setRecordedAt(localNow());
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the observation.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <HeartPulse className="size-4" />
          Record vitals
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record vitals</DialogTitle>
          <DialogDescription>
            Fill in only what was actually measured. Blank fields stay empty in the record.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Resident</Label>
            <Select value={residentId} onValueChange={setResidentId}>
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

          <div className="grid gap-2">
            <Label htmlFor="obs-at">Recorded at</Label>
            <Input
              id="obs-at"
              type="datetime-local"
              value={recordedAt}
              onChange={(e) => setRecordedAt(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="obs-sys">Blood pressure — systolic (mmHg)</Label>
              <Input
                id="obs-sys"
                type="number"
                inputMode="numeric"
                value={sys}
                onChange={(e) => setSys(e.target.value)}
                placeholder="120"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="obs-dia">Blood pressure — diastolic (mmHg)</Label>
              <Input
                id="obs-dia"
                type="number"
                inputMode="numeric"
                value={dia}
                onChange={(e) => setDia(e.target.value)}
                placeholder="80"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="obs-pulse">Pulse (bpm)</Label>
              <Input
                id="obs-pulse"
                type="number"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                placeholder="72"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="obs-temp">Temperature (°C)</Label>
              <Input
                id="obs-temp"
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                placeholder="36.8"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="obs-sugar">Blood sugar (mg/dL)</Label>
              <Input
                id="obs-sugar"
                type="number"
                step="0.1"
                value={sugar}
                onChange={(e) => setSugar(e.target.value)}
                placeholder="110"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="obs-weight">Weight (kg)</Label>
              <Input
                id="obs-weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="58.5"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="obs-note">Care note</Label>
            <Textarea
              id="obs-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Appetite, sleep, mood, anything the next shift should know…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending ? "Saving…" : "Save observation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
