import * as React from "react";
import {
  ShieldCheck,
  Lock,
  User,
  Calendar,
  MapPin,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  FileText,
  Loader2,
  Check,
  Sparkles,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface DigiLockerDocumentData {
  documentReference: string;
  fullName: string;
  dateOfBirthFormatted: string;
  dateOfBirthIso: string;
  address: string;
  source: string;
  issuer: string;
  issueDate: string;
}

const SAMPLE_DIGILOCKER_DOC: DigiLockerDocumentData = {
  documentReference: "DEMO-DOC-0001",
  fullName: "Demo Resident",
  dateOfBirthFormatted: "01 January 1945",
  dateOfBirthIso: "1945-01-01",
  address: "Sample Address, Nagpur",
  source: "Digital document",
  issuer: "Digital Identity Repository",
  issueDate: "12 March 2021",
};

interface DigiLockerAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: DigiLockerDocumentData) => void;
}

type Step = "account" | "consent" | "select-document" | "loading-preview" | "preview" | "complete";

export function DigiLockerAuthDialog({
  open,
  onOpenChange,
  onComplete,
}: DigiLockerAuthDialogProps) {
  const [step, setStep] = React.useState<Step>("account");
  const [selectedDocId, setSelectedDocId] = React.useState<string>("DEMO-DOC-0001");

  // Reset step whenever opened
  React.useEffect(() => {
    if (open) {
      setStep("account");
      setSelectedDocId("DEMO-DOC-0001");
    }
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSelectDocAndPreview = () => {
    setStep("loading-preview");
    // Simulate brief network/verification loading transition
    setTimeout(() => {
      setStep("preview");
    }, 650);
  };

  const handleFinishJourney = () => {
    onComplete(SAMPLE_DIGILOCKER_DOC);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-xl border-border/80 shadow-2xl rounded-2xl"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">DigiLocker Document Sharing Authorization</DialogTitle>

        {/* ── Branded Header ── */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md">
                <ShieldCheck className="size-5 text-white" aria-hidden />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold tracking-tight text-white">
                    DigiLocker
                  </span>
                  <Badge
                    variant="outline"
                    className="border-blue-300/30 bg-blue-500/20 text-[11px] font-normal text-blue-100"
                  >
                    Integration Preview
                  </Badge>
                </div>
                <p className="text-xs text-blue-200">Digital Document Gateway</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-blue-200">
              <Lock className="size-3.5 text-blue-300" aria-hidden />
              <span>Secure Connection</span>
            </div>
          </div>

          {/* Step indicator */}
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] font-medium text-blue-200">
            <StepPill
              num={1}
              label="Account"
              active={step === "account"}
              done={step !== "account"}
            />
            <div className="h-px flex-1 bg-white/15 mx-1.5" />
            <StepPill
              num={2}
              label="Consent"
              active={step === "consent"}
              done={step !== "account" && step !== "consent"}
            />
            <div className="h-px flex-1 bg-white/15 mx-1.5" />
            <StepPill
              num={3}
              label="Document"
              active={step === "select-document" || step === "loading-preview"}
              done={step === "preview" || step === "complete"}
            />
            <div className="h-px flex-1 bg-white/15 mx-1.5" />
            <StepPill
              num={4}
              label="Preview"
              active={step === "preview"}
              done={step === "complete"}
            />
            <div className="h-px flex-1 bg-white/15 mx-1.5" />
            <StepPill num={5} label="Complete" active={step === "complete"} done={false} />
          </div>
        </div>

        {/* ── Step Body Content ── */}
        <div className="p-6">
          {/* STEP B: Account Selection */}
          {step === "account" && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  Connect your Digital Document Account
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  You are continuing to share verified intake documents with{" "}
                  <strong className="text-foreground">SAHAYAK Elderly Care</strong>.
                </p>
              </div>

              <div className="rounded-xl border border-blue-200/70 bg-blue-50/50 p-4 dark:border-blue-900/60 dark:bg-blue-950/20">
                <div className="flex items-start gap-3.5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                    <User className="size-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Demo Resident</span>
                      <Badge className="bg-blue-600 text-white hover:bg-blue-600 text-[11px]">
                        Active Account
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      demo.resident@digitalid.in
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <span>Linked Reference:</span>
                      <span className="font-mono font-medium text-foreground">•••• •••• 1042</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <p>
                  By continuing, you agree to access your digital document locker to select and
                  share required admission verification records.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setStep("consent")}
                >
                  Continue
                  <ArrowRight className="ml-1.5 size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP C: Consent */}
          {step === "consent" && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  Consent Request
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  <strong className="text-foreground">SAHAYAK Elderly Care</strong> requests your
                  authorization to retrieve specific document details for registration.
                </p>
              </div>

              <div className="rounded-xl border border-border p-4 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Information Requested
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-2.5">
                    <User className="size-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Full Name</p>
                      <p className="text-xs text-muted-foreground">Resident legal name</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-2.5">
                    <Calendar className="size-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Date of Birth</p>
                      <p className="text-xs text-muted-foreground">Age and birth record</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-2.5">
                    <MapPin className="size-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Address</p>
                      <p className="text-xs text-muted-foreground">Primary residential address</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Purpose & Validity</p>
                <p>Purpose: Admission verification and intake documentation for care records.</p>
                <p>Validity: One-time document sharing transaction.</p>
              </div>

              <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-border/60">
                <Button variant="outline" onClick={() => setStep("account")}>
                  <ArrowLeft className="mr-1.5 size-4" />
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={handleClose}>
                    Deny
                  </Button>
                  <Button
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => setStep("select-document")}
                  >
                    Allow Access
                    <ArrowRight className="ml-1.5 size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP D: Document Selection */}
          {step === "select-document" && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  Select Identity Document
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose an authorized document from your digital repository to share.
                </p>
              </div>

              <div className="space-y-3">
                {/* Selectable Document 1 */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedDocId("DEMO-DOC-0001")}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedDocId("DEMO-DOC-0001")}
                  className={`group relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all ${
                    selectedDocId === "DEMO-DOC-0001"
                      ? "border-blue-600 bg-blue-50/60 shadow-sm dark:bg-blue-950/30"
                      : "border-border hover:border-blue-300 bg-card"
                  }`}
                >
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      selectedDocId === "DEMO-DOC-0001"
                        ? "bg-blue-600 text-white"
                        : "bg-muted text-muted-foreground group-hover:bg-blue-100 group-hover:text-blue-700"
                    }`}
                  >
                    <FileCheck className="size-6" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground text-sm">
                        Resident Identity Certificate
                      </h4>
                      <Badge
                        variant="secondary"
                        className="font-mono text-[10px] uppercase tracking-wider"
                      >
                        DEMO-DOC-0001
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Issuer: Digital Document Repository • Updated: 2021
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <Check className="size-3" />
                        Available to Share
                      </span>
                    </div>
                  </div>
                  <div className="pt-0.5">
                    <div
                      className={`size-5 rounded-full border flex items-center justify-center ${
                        selectedDocId === "DEMO-DOC-0001"
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {selectedDocId === "DEMO-DOC-0001" && <Check className="size-3" />}
                    </div>
                  </div>
                </div>

                {/* Document 2 (Inactive secondary sample for realism) */}
                <div className="opacity-60 flex items-start gap-4 rounded-xl border border-dashed border-border p-4 bg-muted/20">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <FileText className="size-6" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground text-sm">Senior Health Card</h4>
                      <Badge variant="outline" className="text-[10px]">
                        Optional
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Issuer: Ministry of Health • General medical card
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-border/60">
                <Button variant="outline" onClick={() => setStep("consent")}>
                  <ArrowLeft className="mr-1.5 size-4" />
                  Back
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={handleSelectDocAndPreview}
                >
                  Select &amp; Preview
                  <ArrowRight className="ml-1.5 size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP: Loading Transition */}
          {step === "loading-preview" && (
            <div className="py-12 text-center space-y-4 animate-in fade-in-50 duration-200">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                <Loader2 className="size-7 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-semibold text-foreground">
                  Retrieving Digital Document...
                </h4>
                <p className="text-xs text-muted-foreground">
                  Fetching verified metadata for DEMO-DOC-0001
                </p>
              </div>
            </div>
          )}

          {/* STEP E: Document Preview */}
          {step === "preview" && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground">
                    Document Preview
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Inspect the attributes that will be shared with SAHAYAK.
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                >
                  Digital Record
                </Badge>
              </div>

              {/* Polished Document Card */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-blue-200/90 bg-gradient-to-b from-white to-slate-50/70 p-5 shadow-sm dark:border-blue-900/60 dark:from-slate-900 dark:to-slate-950">
                <div className="absolute right-0 top-0 size-32 translate-x-12 -translate-y-12 rounded-full bg-blue-100/50 blur-2xl pointer-events-none" />

                {/* Document Header */}
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-md bg-blue-600 text-white">
                      <ShieldCheck className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                        Digital Identity Record
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Repository Issued Document
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {SAMPLE_DIGILOCKER_DOC.documentReference}
                    </span>
                    <p className="text-[10px] text-muted-foreground">Ref Identifier</p>
                  </div>
                </div>

                {/* Document Attributes Grid */}
                <div className="grid gap-3.5 py-4 sm:grid-cols-2 text-sm">
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Resident Full Name
                    </span>
                    <p className="font-semibold text-foreground">
                      {SAMPLE_DIGILOCKER_DOC.fullName}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Date of Birth
                    </span>
                    <p className="font-semibold text-foreground">
                      {SAMPLE_DIGILOCKER_DOC.dateOfBirthFormatted}
                    </p>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Registered Address
                    </span>
                    <p className="font-medium text-foreground">{SAMPLE_DIGILOCKER_DOC.address}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Source
                    </span>
                    <p className="text-xs font-medium text-muted-foreground">
                      {SAMPLE_DIGILOCKER_DOC.source}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Issue Date
                    </span>
                    <p className="text-xs font-medium text-muted-foreground">
                      {SAMPLE_DIGILOCKER_DOC.issueDate}
                    </p>
                  </div>
                </div>

                {/* Subtle digital seal */}
                <div className="flex items-center justify-between rounded-lg bg-blue-50/70 p-2.5 text-[11px] text-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="size-3.5 text-blue-600 dark:text-blue-400" />
                    Digitally Authorized for SAHAYAK Admission
                  </span>
                  <span className="font-mono text-[10px] opacity-75">SHA-256 Validated</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-border/60">
                <Button variant="outline" onClick={() => setStep("select-document")}>
                  <ArrowLeft className="mr-1.5 size-4" />
                  Back
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setStep("complete")}
                >
                  Confirm &amp; Share Document
                  <ArrowRight className="ml-1.5 size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP F: Complete */}
          {step === "complete" && (
            <div className="space-y-5 animate-in fade-in-50 duration-200 text-center py-2">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                <CheckCircle2 className="size-8" />
              </div>

              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-foreground">
                  Document Sharing Complete
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Your identity document (
                  <span className="font-mono font-medium text-foreground">
                    {SAMPLE_DIGILOCKER_DOC.documentReference}
                  </span>
                  ) has been successfully authorized and transmitted to SAHAYAK.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4 text-left max-w-md mx-auto space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Shared Profile Snapshot
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Name:</span>{" "}
                    <span className="font-semibold text-foreground">
                      {SAMPLE_DIGILOCKER_DOC.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">DOB:</span>{" "}
                    <span className="font-semibold text-foreground">
                      {SAMPLE_DIGILOCKER_DOC.dateOfBirthFormatted}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Address:</span>{" "}
                    <span className="font-semibold text-foreground">
                      {SAMPLE_DIGILOCKER_DOC.address}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <Button
                  size="lg"
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                  onClick={handleFinishJourney}
                >
                  <Sparkles className="mr-2 size-4" />
                  Return to SAHAYAK
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepPill({
  num,
  label,
  active,
  done,
}: {
  num: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 transition-colors ${
        active
          ? "text-white font-semibold"
          : done
            ? "text-blue-100 font-normal"
            : "text-blue-300/60 font-normal"
      }`}
    >
      <div
        className={`flex size-4.5 items-center justify-center rounded-full text-[10px] ${
          active
            ? "bg-white text-blue-900 font-bold"
            : done
              ? "bg-blue-400/30 text-white"
              : "bg-white/10 text-blue-300"
        }`}
      >
        {done ? <Check className="size-3" /> : num}
      </div>
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}
