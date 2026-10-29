import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Eye, ExternalLink, Plus, ShieldCheck } from "lucide-react";

import { AdminOnly } from "@/components/common/AdminOnly";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState, PageSkeleton } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { FacilityFormDialog } from "@/components/facilities/FacilityFormDialog";
import { FacilityRowActions } from "@/components/facilities/FacilityRowActions";
import { FacilityVerifyDialog } from "@/components/facilities/FacilityVerifyDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  facilityLocation,
  useFacilities,
  type FacilityWithAudit,
} from "@/features/directory/queries";

export const Route = createFileRoute("/_shell/facilities")({
  head: () => ({
    meta: [{ title: "Facility listings — SAHAAYAK" }],
  }),
  component: () => (
    <AdminOnly>
      <FacilitiesManager />
    </AdminOnly>
  ),
});

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function FacilitiesManager() {
  const { data: facilities = [], isLoading, isError, refetch } = useFacilities();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FacilityWithAudit | null>(null);
  const [verifying, setVerifying] = useState<FacilityWithAudit | null>(null);

  const total = facilities.length;
  const published = facilities.filter((f) => f.status === "published").length;
  const verified = facilities.filter((f) => f.verification === "verified").length;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (f: FacilityWithAudit) => {
    setEditing(f);
    setFormOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
      <PageHeader
        eyebrow="Public directory"
        title="Facility listings"
        description="Manage the care homes shown on the public directory. Listings are hidden until they are verified and published."
        actions={
          <>
            <Button asChild variant="outline">
              <a href="/homes" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" aria-hidden /> View public directory
              </a>
            </Button>
            <Button onClick={openCreate}>
              <Plus className="size-4" aria-hidden /> Add listing
            </Button>
          </>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total listings" value={total} icon={Building2} />
        <StatCard
          label="Published"
          value={published}
          hint="Visible to everyone on /homes"
          icon={Eye}
          tone="info"
        />
        <StatCard
          label="Verified"
          value={verified}
          hint="Checked by an administrator"
          icon={ShieldCheck}
          tone="done"
        />
      </div>

      {isLoading ? (
        <PageSkeleton rows={5} />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : facilities.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No listings yet"
          description="Add the first care home to start building the public directory."
          action={
            <Button onClick={openCreate}>
              <Plus className="size-4" aria-hidden /> Add listing
            </Button>
          }
        />
      ) : (
        <div className="surface-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Verified on</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-12 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facilities.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <p className="font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">/homes/{f.slug}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {facilityLocation(f) || "—"}
                  </TableCell>
                  <TableCell>
                    {f.status === "published" ? (
                      <StatusBadge status="published" tone="info" label="Published" />
                    ) : (
                      <StatusBadge status="draft" tone="neutral" label="Draft" />
                    )}
                  </TableCell>
                  <TableCell>
                    {f.verification === "verified" ? (
                      <StatusBadge status="verified" tone="done" label="Verified" />
                    ) : (
                      <StatusBadge status="unverified" tone="neutral" label="Unverified" />
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(f.audit?.verified_at ?? null)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(f.updated_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <FacilityRowActions
                      facility={f}
                      onEdit={() => openEdit(f)}
                      onVerify={() => setVerifying(f)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        Visitors can find these listings at{" "}
        <a
          href="/homes"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          /homes
        </a>
        . Only verified, published listings are visible there — drafts stay private.
      </p>

      <FacilityFormDialog
        facility={editing}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
      />
      <FacilityVerifyDialog
        facility={verifying}
        open={verifying !== null}
        onOpenChange={(open) => {
          if (!open) setVerifying(null);
        }}
      />
    </div>
  );
}
