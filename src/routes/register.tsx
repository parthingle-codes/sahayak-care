import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  HeartHandshake,
  Loader2,
  CheckCircle2,
  FlaskConical,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useSubmitRegistration } from "@/features/registrations/queries";
import {
  DigiLockerAuthDialog,
  type DigiLockerDocumentData,
} from "@/components/registrations/DigiLockerAuthDialog";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register a resident — SAHAAYAK Elderly Care" },
      {
        name: "description",
        content:
          "Fill the online admission form for an elderly care home: resident details, contact person and health information at intake. No paperwork needed.",
      },
      { property: "og:title", content: "Register a resident — SAHAAYAK Elderly Care" },
      {
        property: "og:description",
        content:
          "Submit an admission request online. Care home staff review it and confirm the admission.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Please enter the resident's full name").max(120),
  contact_name: z.string().trim().min(2, "Please enter the contact person's name").max(120),
  contact_phone: z
    .string()
    .trim()
    .min(7, "Please enter a reachable phone number")
    .max(20, "Phone number is too long"),
  contact_email: z
    .string()
    .trim()
    .max(255)
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
});

const emptyForm = {
  full_name: "",
  gender: "",
  date_of_birth: "",
  mobility: "independent",
  preferred_admission_date: "",
  resident_notes: "",
  contact_name: "",
  contact_relationship: "",
  contact_phone: "",
  contact_email: "",
  contact_address: "",
  known_conditions: "",
  current_medicines: "",
};

function RegisterPage() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reference, setReference] = useState<string | null>(null);
  const [digiLockerOpen, setDigiLockerOpen] = useState(false);
  const [retrievedDoc, setRetrievedDoc] = useState<DigiLockerDocumentData | null>(null);
  const submit = useSubmitRegistration();

  const set = (key: keyof typeof emptyForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function handleApplyRetrievedData() {
    if (!retrievedDoc) return;
    setForm((prev) => ({
      ...prev,
      full_name: retrievedDoc.fullName,
      date_of_birth: retrievedDoc.dateOfBirthIso,
      contact_address: prev.contact_address || retrievedDoc.address,
    }));
    toast.success("Applied document details into registration form");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    try {
      const row = await submit.mutateAsync({
        full_name: form.full_name.trim(),
        gender: (form.gender || null) as never,
        date_of_birth: form.date_of_birth || null,
        mobility: form.mobility as never,
        preferred_admission_date: form.preferred_admission_date || null,
        resident_notes: form.resident_notes.trim() || null,
        contact_name: form.contact_name.trim(),
        contact_relationship: form.contact_relationship.trim() || null,
        contact_phone: form.contact_phone.trim(),
        contact_email: form.contact_email.trim() || null,
        contact_address: form.contact_address.trim() || null,
        known_conditions: form.known_conditions.trim() || null,
        current_medicines: form.current_medicines.trim() || null,
      });
      setReference(row.reference);
      setForm(emptyForm);
      setRetrievedDoc(null);
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Could not send the form. Please check your connection and try again.",
      });
    }
  }

  return (
    <div className="min-h-screen public-canvas px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          to="/"
          className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-card/80 px-4 py-2 font-display text-sm font-semibold tracking-wide text-foreground shadow-sm backdrop-blur transition-colors hover:border-primary/40"
        >
          <HeartHandshake className="size-5 text-primary" aria-hidden />
          SAHAAYAK
        </Link>

        {reference ? (
          <Card className="surface-glass animate-rise rounded-3xl shadow-[var(--shadow-lift)]">
            <CardHeader className="text-center">
              <CheckCircle2 className="mx-auto size-10 text-done" aria-hidden />
              <CardTitle className="mt-2">Admission request received</CardTitle>
              <CardDescription>
                Care home staff will review the details and get in touch with the contact person.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">Your reference number</p>
              <p className="font-display text-2xl font-semibold tracking-wide">{reference}</p>
              <Button variant="outline" className="w-full" onClick={() => setReference(null)}>
                Register another resident
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="surface-glass animate-rise rounded-3xl shadow-[var(--shadow-lift)]">
            <CardHeader>
              <CardTitle>Resident registration</CardTitle>
              <CardDescription>
                Fill in whatever you know — staff can complete the rest at admission. This form
                keeps care records only; it is not medical advice.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* ── DigiLocker DEMO MODE notice ── */}
              <div
                role="note"
                aria-label="DigiLocker demo mode notice"
                className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
              >
                <FlaskConical
                  className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
                  aria-hidden
                />
                <span>
                  <strong>DEMO MODE</strong> — This feature does not perform real Aadhaar or
                  DigiLocker verification. No identity verification has occurred.
                </span>
              </div>

              {/* ── DigiLocker Integration Panel ── */}
              <div className="mb-6 rounded-2xl border border-blue-200/90 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-blue-50/80 p-4.5 dark:border-blue-900/60 dark:from-blue-950/25 dark:to-indigo-950/25">
                <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-foreground">
                          DigiLocker Verification
                        </h3>
                        <Badge
                          variant="outline"
                          className="border-blue-300/80 bg-blue-100/60 text-[10px] text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-normal"
                        >
                          Integration Preview
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Authorize digital document sharing to automatically retrieve intake details.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setDigiLockerOpen(true)}
                    className="bg-blue-600 text-white hover:bg-blue-700 shadow-xs shrink-0 cursor-pointer text-xs font-semibold h-9"
                  >
                    <ShieldCheck className="mr-1.5 size-4" />
                    Continue with DigiLocker
                  </Button>
                </div>

                {/* Retrieved Document Details Card */}
                {retrievedDoc && (
                  <div className="mt-4 rounded-xl border border-blue-200/90 bg-card p-3.5 shadow-xs dark:border-blue-800/80 space-y-3 animate-in fade-in-50 duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                        <span className="font-medium text-xs text-foreground">
                          Retrieved Document:{" "}
                          <span className="font-mono text-blue-700 dark:text-blue-300">
                            {retrievedDoc.documentReference}
                          </span>
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300"
                      >
                        Document Shared
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-2 rounded-lg bg-muted/40 p-2.5 text-xs sm:grid-cols-3">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Name</span>
                        <span className="font-semibold text-foreground">
                          {retrievedDoc.fullName}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">DOB</span>
                        <span className="font-semibold text-foreground">
                          {retrievedDoc.dateOfBirthFormatted}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Address</span>
                        <span className="font-semibold text-foreground truncate block">
                          {retrievedDoc.address}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2 text-xs">
                      <span className="text-muted-foreground text-[11px]">
                        Review sample data. Form fields are never altered without explicit
                        confirmation.
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setRetrievedDoc(null)}
                          className="h-7 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Clear
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleApplyRetrievedData}
                          className="h-7 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 text-xs font-medium"
                        >
                          <Sparkles className="mr-1.5 size-3.5" />
                          Fill into form
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* DigiLocker Dedicated Authorization Dialog */}
              <DigiLockerAuthDialog
                open={digiLockerOpen}
                onOpenChange={setDigiLockerOpen}
                onComplete={(doc) => {
                  setRetrievedDoc(doc);
                  toast.success("Document shared from DigiLocker! Review details below.");
                }}
              />
              <form onSubmit={handleSubmit} className="space-y-8">
                <section className="space-y-4">
                  <h2 className="font-display text-base font-semibold">Resident details</h2>
                  <Field id="full_name" label="Full name" required error={errors["full_name"]}>
                    <Input
                      id="full_name"
                      value={form.full_name}
                      onChange={(e) => set("full_name")(e.target.value)}
                      placeholder="e.g. Kamalabai Deshmukh"
                      required
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="gender" label="Gender">
                      <Select value={form.gender} onValueChange={set("gender")}>
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field id="date_of_birth" label="Date of birth">
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={form.date_of_birth}
                        onChange={(e) => set("date_of_birth")(e.target.value)}
                      />
                    </Field>
                    <Field id="mobility" label="Mobility">
                      <Select value={form.mobility} onValueChange={set("mobility")}>
                        <SelectTrigger id="mobility">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="independent">Independent</SelectItem>
                          <SelectItem value="walker">Uses walker</SelectItem>
                          <SelectItem value="wheelchair">Wheelchair</SelectItem>
                          <SelectItem value="bedridden">Bedridden</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field id="preferred_admission_date" label="Preferred admission date">
                      <Input
                        id="preferred_admission_date"
                        type="date"
                        value={form.preferred_admission_date}
                        onChange={(e) => set("preferred_admission_date")(e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field id="resident_notes" label="Anything else staff should know">
                    <Textarea
                      id="resident_notes"
                      value={form.resident_notes}
                      onChange={(e) => set("resident_notes")(e.target.value)}
                      rows={3}
                      maxLength={1000}
                    />
                  </Field>
                </section>

                <section className="space-y-4">
                  <h2 className="font-display text-base font-semibold">Contact person</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="contact_name" label="Name" required error={errors["contact_name"]}>
                      <Input
                        id="contact_name"
                        value={form.contact_name}
                        onChange={(e) => set("contact_name")(e.target.value)}
                        required
                      />
                    </Field>
                    <Field id="contact_relationship" label="Relationship to resident">
                      <Input
                        id="contact_relationship"
                        value={form.contact_relationship}
                        onChange={(e) => set("contact_relationship")(e.target.value)}
                        placeholder="e.g. Son, Daughter, Nephew"
                      />
                    </Field>
                    <Field
                      id="contact_phone"
                      label="Phone number"
                      required
                      error={errors["contact_phone"]}
                    >
                      <Input
                        id="contact_phone"
                        type="tel"
                        value={form.contact_phone}
                        onChange={(e) => set("contact_phone")(e.target.value)}
                        required
                      />
                    </Field>
                    <Field id="contact_email" label="Email" error={errors["contact_email"]}>
                      <Input
                        id="contact_email"
                        type="email"
                        value={form.contact_email}
                        onChange={(e) => set("contact_email")(e.target.value)}
                      />
                    </Field>
                  </div>
                  <Field id="contact_address" label="Address">
                    <Textarea
                      id="contact_address"
                      value={form.contact_address}
                      onChange={(e) => set("contact_address")(e.target.value)}
                      rows={2}
                      maxLength={500}
                    />
                  </Field>
                </section>

                <section className="space-y-4">
                  <h2 className="font-display text-base font-semibold">Health at intake</h2>
                  <Field id="known_conditions" label="Known conditions or allergies">
                    <Textarea
                      id="known_conditions"
                      value={form.known_conditions}
                      onChange={(e) => set("known_conditions")(e.target.value)}
                      rows={3}
                      maxLength={1000}
                      placeholder="e.g. High blood pressure, diabetes, allergic to penicillin"
                    />
                  </Field>
                  <Field id="current_medicines" label="Medicines currently taken">
                    <Textarea
                      id="current_medicines"
                      value={form.current_medicines}
                      onChange={(e) => set("current_medicines")(e.target.value)}
                      rows={3}
                      maxLength={1000}
                      placeholder="Name, dose and timing, as far as you know"
                    />
                  </Field>
                </section>

                {errors["form"] && <p className="text-sm text-destructive">{errors["form"]}</p>}

                <Button type="submit" className="w-full" disabled={submit.isPending}>
                  {submit.isPending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
                  Send registration
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Staff sign in is at{" "}
                  <Link to="/auth" className="underline underline-offset-4">
                    the staff login page
                  </Link>
                  .
                </p>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
