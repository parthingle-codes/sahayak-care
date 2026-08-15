import { useEffect, useState } from "react";
import { Pencil, Stethoscope } from "lucide-react";
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
  useCreateCondition,
  useResidents,
  useUpdateCondition,
  type Condition,
} from "@/features/care/queries";

/** Adds or edits an already-diagnosed condition on a resident's record. */
export function ConditionFormDialog({ record }: { record?: Condition }) {
  const isEdit = Boolean(record);
  const [open, setOpen] = useState(false);
  const [residentId, setResidentId] = useState("");
  const [condition, setCondition] = useState("");
  const [diagnosedOn, setDiagnosedOn] = useState("");
  const [notes, setNotes] = useState("");
  const { data: residents = [], isLoading } = useResidents();
  const create = useCreateCondition();
  const update = useUpdateCondition();
  const pending = create.isPending || update.isPending;

  useEffect(() => {
    if (!open) return;
    setResidentId(record?.resident_id ?? "");
    setCondition(record?.condition ?? "");
    setDiagnosedOn(record?.diagnosed_on ?? "");
    setNotes(record?.notes ?? "");
  }, [open, record]);

  const submit = async () => {
    if (!residentId) {
      toast.error("Choose the resident this condition belongs to.");
      return;
    }
    if (!condition.trim()) {
      toast.error("Please enter the condition.");
      return;
    }
    const values = {
      resident_id: residentId,
      condition: condition.trim(),
      diagnosed_on: diagnosedOn || null,
      notes: notes.trim() || null,
    };
    try {
      if (record) {
        await update.mutateAsync({ id: record.id, values });
        toast.success("Condition updated.");
      } else {
        await create.mutateAsync(values);
        toast.success("Medical condition added.");
      }
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the condition.");
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
          <Button variant="outline">
            <Stethoscope className="size-4" />
            Add medical condition
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit medical condition" : "Add medical condition"}</DialogTitle>
          <DialogDescription>
            Record a condition already diagnosed by a doctor. SAHAAYAK never diagnoses.
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
            <Label htmlFor="cond-name">Condition</Label>
            <Input
              id="cond-name"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="e.g. Type 2 diabetes, hypertension"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cond-date">Diagnosed on</Label>
            <Input
              id="cond-date"
              type="date"
              value={diagnosedOn}
              onChange={(e) => setDiagnosedOn(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cond-notes">Notes</Label>
            <Textarea
              id="cond-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Treating doctor, ongoing care instructions…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? "Saving…" : isEdit ? "Save changes" : "Save condition"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
