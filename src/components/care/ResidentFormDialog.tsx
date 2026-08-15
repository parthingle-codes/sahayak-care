import { useEffect, useState } from "react";
import { Pencil, UserPlus } from "lucide-react";
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
import { useCreateResident, useUpdateResident, type Resident } from "@/features/care/queries";

const today = () => new Date().toISOString().slice(0, 10);

/** Registers a resident, or edits an existing record when `resident` is given. */
export function ResidentFormDialog({ resident }: { resident?: Resident }) {
  const isEdit = Boolean(resident);
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<string>("");
  const [dob, setDob] = useState("");
  const [room, setRoom] = useState("");
  const [admission, setAdmission] = useState(today());
  const [mobility, setMobility] = useState("independent");
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");
  const create = useCreateResident();
  const update = useUpdateResident();
  const pending = create.isPending || update.isPending;

  // Refills the form each time it opens so edits always start from saved data.
  useEffect(() => {
    if (!open) return;
    setFullName(resident?.full_name ?? "");
    setGender(resident?.gender ?? "");
    setDob(resident?.date_of_birth ?? "");
    setRoom(resident?.room_label ?? "");
    setAdmission(resident?.admission_date ?? today());
    setMobility(resident?.mobility ?? "independent");
    setStatus(resident?.status ?? "active");
    setNotes(resident?.notes ?? "");
  }, [open, resident]);

  const submit = async () => {
    if (!fullName.trim()) {
      toast.error("Please enter the resident's full name.");
      return;
    }
    const values = {
      full_name: fullName.trim(),
      gender: (gender || null) as never,
      date_of_birth: dob || null,
      room_label: room.trim() || null,
      admission_date: admission || today(),
      mobility: mobility as never,
      status: status as never,
      notes: notes.trim() || null,
    };
    try {
      if (resident) {
        await update.mutateAsync({ id: resident.id, values });
        toast.success("Resident details updated.");
      } else {
        await create.mutateAsync(values);
        toast.success("Resident added.");
      }
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the resident.");
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
            <UserPlus className="size-4" />
            Add resident
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit resident" : "Add resident"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Correct any detail that was recorded wrongly. Changes are saved immediately."
              : "Only the details the home actually keeps. Everything except the name is optional."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="res-name">Full name</Label>
            <Input
              id="res-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Kamalabai Deshmukh"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Not recorded" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="res-dob">Date of birth</Label>
              <Input id="res-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="res-room">Room</Label>
              <Input
                id="res-room"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. A-102"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="res-adm">Admission date</Label>
              <Input
                id="res-adm"
                type="date"
                value={admission}
                onChange={(e) => setAdmission(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Mobility</Label>
              <Select value={mobility} onValueChange={setMobility}>
                <SelectTrigger>
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
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="res-notes">Notes</Label>
            <Textarea
              id="res-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Diet, language, family arrangements…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? "Saving…" : isEdit ? "Save changes" : "Save resident"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
