import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { HeartHandshake, Loader2, CheckCircle2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const submit = useSubmitRegistration();

  const set = (key: keyof typeof emptyForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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
    <div className="min-h-screen bg-secondary/40 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          to="/"
          className="mb-6 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <HeartHandshake className="size-5 text-primary" aria-hidden />
          SAHAAYAK
        </Link>

        {reference ? (
          <Card className="border-border/70 shadow-sm">
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
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Resident registration</CardTitle>
              <CardDescription>
                Fill in whatever you know — staff can complete the rest at admission. This form keeps
                care records only; it is not medical advice.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                <section className="space-y-4">
                  <h2 className="font-display text-base font-semibold">Resident details</h2>
                  <Field
                    id="full_name"
                    label="Full name"
                    required
                    error={errors["full_name"]}
                  >
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
                    <Field
                      id="contact_name"
                      label="Name"
                      required
                      error={errors["contact_name"]}
                    >
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

                {errors["form"] && (
                  <p className="text-sm text-destructive">{errors["form"]}</p>
                )}

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
