import { StatusBadge } from "@/components/common/StatusBadge";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { ReviewRegistrationDialog } from "@/components/registrations/ReviewRegistrationDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRegistrations, type Registration } from "@/features/registrations/queries";

export const Route = createFileRoute("/_shell/registrations")({
  head: () => ({
    meta: [
      { title: "Registrations — SAHAAYAK Elderly Care" },
      {
        name: "description",
        content:
          "Review online admission requests for the care home and turn an approved request into a resident record in one step.",
      },
      { property: "og:title", content: "Registrations — SAHAAYAK Elderly Care" },
      {
        property: "og:description",
        content: "Pending, approved and rejected online admission requests in one queue.",
      },
    ],
  }),
  component: RegistrationsPage,
});

function RegistrationsPage() {
  const { data: registrations = [], isLoading } = useRegistrations();
  const pending = registrations.filter((r) => r.status === "pending");
  const approved = registrations.filter((r) => r.status === "approved");
  const rejected = registrations.filter((r) => r.status === "rejected");

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Registrations"
        description="Admission forms families filled in online. Review the details, then approve to create the resident record."
        actions={
          <Button asChild variant="outline">
            <Link to="/register" target="_blank">
              Open public form
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : registrations.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No registrations yet"
          description="Share the public registration link with families. Submitted forms arrive here for review."
        />
      ) : (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <RegistrationTable rows={pending} emptyLabel="Nothing waiting for review." />
          </TabsContent>
          <TabsContent value="approved">
            <RegistrationTable rows={approved} emptyLabel="No approved registrations yet." />
          </TabsContent>
          <TabsContent value="rejected">
            <RegistrationTable rows={rejected} emptyLabel="No rejected registrations." />
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}

function RegistrationTable({ rows, emptyLabel }: { rows: Registration[]; emptyLabel: string }) {
  if (rows.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <div className="surface-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Resident</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-xs">{r.reference}</TableCell>
              <TableCell className="font-medium">
                {r.resident_id ? (
                  <Link
                    to="/residents/$id"
                    params={{ id: r.resident_id }}
                    className="underline-offset-4 hover:underline"
                  >
                    {r.full_name}
                  </Link>
                ) : (
                  r.full_name
                )}
              </TableCell>
              <TableCell>
                {r.contact_name}
                <span className="block text-xs text-muted-foreground">{r.contact_phone}</span>
              </TableCell>
              <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <StatusBadge status={r.status} />
              </TableCell>
              <TableCell className="text-right">
                <ReviewRegistrationDialog registration={r} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
