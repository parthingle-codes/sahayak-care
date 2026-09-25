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
import { useSubmitDonation } from "@/features/donations/queries";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate or volunteer — SAHAAYAK Elderly Care" },
      {
        name: "description",
        content:
          "Offer food, clothing, everyday essentials, financial support or your time to a small old age home. Staff get in touch to arrange the hand-over.",
      },
      { property: "og:title", content: "Donate or volunteer — SAHAAYAK Elderly Care" },
      {
        property: "og:description",
        content: "Support the residents with food, clothes, essentials, funds or volunteering.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DonatePage,
});

const schema = z.object({
  donor_name: z.string().trim().min(2, "Please enter your name").max(120),
  donor_phone: z
    .string()
    .trim()
    .min(7, "Please enter a reachable phone number")
    .max(20, "Phone number is too long"),
  donor_email: z
    .string()
    .trim()
    .max(255)
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
});

const emptyForm = {
  donation_type: "food",
  description: "",
  amount: "",
  preferred_date: "",
  donor_name: "",
  donor_phone: "",
  donor_email: "",
  donor_address: "",
};

function DonatePage() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reference, setReference] = useState<string | null>(null);
  const submit = useSubmitDonation();

  const set = (key: keyof typeof emptyForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isFinancial = form.donation_type === "financial";

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
    const amount = isFinancial && form.amount ? Number(form.amount) : null;
    if (amount !== null && (!Number.isFinite(amount) || amount <= 0)) {
      setErrors({ amount: "Please enter an amount greater than zero" });
      return;
    }
    setErrors({});
    try {
      const row = await submit.mutateAsync({
        donation_type: form.donation_type as never,
        description: form.description.trim() || null,
        amount,
        preferred_date: form.preferred_date || null,
        donor_name: form.donor_name.trim(),
        donor_phone: form.donor_phone.trim(),
        donor_email: form.donor_email.trim() || null,
        donor_address: form.donor_address.trim() || null,
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
              <CardTitle className="mt-2">Thank you for your kindness</CardTitle>
              <CardDescription>
                Staff will call you to arrange the hand-over and confirm what is needed most.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">Your reference number</p>
              <p className="font-display text-2xl font-semibold tracking-wide">{reference}</p>
              <Button variant="outline" className="w-full" onClick={() => setReference(null)}>
                Offer something else
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Donate or volunteer</CardTitle>
              <CardDescription>
                Tell us what you would like to give — food, clothes, everyday essentials, funds or
                your time. Nothing is paid here; staff contact you to arrange it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                <section className="space-y-4">
                  <h2 className="font-display text-base font-semibold">What you would like to give</h2>
                  <Field id="donation_type" label="Type of support" required>
                    <Select value={form.donation_type} onValueChange={set("donation_type")}>
                      <SelectTrigger id="donation_type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="essentials">Essentials &amp; supplies</SelectItem>
                        <SelectItem value="financial">Financial support</SelectItem>
                        <SelectItem value="volunteering">Volunteering my time</SelectItem>
                        <SelectItem value="other">Something else</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field id="description" label="Details" error={errors["description"]}>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => set("description")(e.target.value)}
                      rows={3}
                      maxLength={1000}
                      placeholder="e.g. 20 kg rice and 10 kg dal, or 15 warm blankets in good condition"
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {isFinancial && (
                      <Field id="amount" label="Amount (₹)" error={errors["amount"]}>
                        <Input
                          id="amount"
                          type="number"
                          min="1"
                          step="1"
                          value={form.amount}
                          onChange={(e) => set("amount")(e.target.value)}
                          placeholder="e.g. 5000"
                        />
                      </Field>
                    )}
                    <Field id="preferred_date" label="Preferred date">
                      <Input
                        id="preferred_date"
                        type="date"
                        value={form.preferred_date}
                        onChange={(e) => set("preferred_date")(e.target.value)}
                      />
                    </Field>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="font-display text-base font-semibold">Your details</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="donor_name" label="Name" required error={errors["donor_name"]}>
                      <Input
                        id="donor_name"
                        value={form.donor_name}
                        onChange={(e) => set("donor_name")(e.target.value)}
                        required
                      />
                    </Field>
                    <Field
                      id="donor_phone"
                      label="Phone number"
                      required
                      error={errors["donor_phone"]}
                    >
                      <Input
                        id="donor_phone"
                        type="tel"
                        value={form.donor_phone}
                        onChange={(e) => set("donor_phone")(e.target.value)}
                        required
                      />
                    </Field>
                    <Field id="donor_email" label="Email" error={errors["donor_email"]}>
                      <Input
                        id="donor_email"
                        type="email"
                        value={form.donor_email}
                        onChange={(e) => set("donor_email")(e.target.value)}
                      />
                    </Field>
                  </div>
                  <Field id="donor_address" label="Address">
                    <Textarea
                      id="donor_address"
                      value={form.donor_address}
                      onChange={(e) => set("donor_address")(e.target.value)}
                      rows={2}
                      maxLength={500}
                    />
                  </Field>
                </section>

                {errors["form"] && <p className="text-sm text-destructive">{errors["form"]}</p>}

                <Button type="submit" className="w-full" disabled={submit.isPending}>
                  {submit.isPending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
                  Send offer
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  No payment is collected on this page. Staff sign in is at{" "}
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
