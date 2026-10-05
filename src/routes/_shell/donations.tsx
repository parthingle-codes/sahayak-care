import { StatusBadge } from "@/components/common/StatusBadge";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Gift, HandHeart, IndianRupee, PackageCheck } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DonationReviewDialog } from "@/components/donations/DonationReviewDialog";
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
import { donationTypeLabels, useDonations, type Donation } from "@/features/donations/queries";

export const Route = createFileRoute("/_shell/donations")({
  head: () => ({
    meta: [
      { title: "Donations — SAHAAYAK Elderly Care" },
      {
        name: "description",
        content:
          "Track offers of food, clothing, essentials, funds and volunteering for the care home, from first offer to received.",
      },
      { property: "og:title", content: "Donations — SAHAAYAK Elderly Care" },
      {
        property: "og:description",
        content: "Pending, accepted, received and declined donation offers in one queue.",
      },
    ],
  }),
  component: DonationsPage,
});

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;

function DonationsPage() {
  const { data: donations = [], isLoading } = useDonations();

  const pending = donations.filter((d) => d.status === "pending");
  const accepted = donations.filter((d) => d.status === "accepted");
  const received = donations.filter((d) => d.status === "received");
  const declined = donations.filter((d) => d.status === "declined");

  const sum = (rows: Donation[]) => rows.reduce((total, d) => total + Number(d.amount ?? 0), 0);
  const pledged = sum([...pending, ...accepted]);
  const collected = sum(received);
  const inKindOpen = [...pending, ...accepted].filter((d) => d.donation_type !== "financial").length;

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Donations & support"
        description="Offers of food, clothing, essentials, funds and volunteering from the community. Nothing is paid online — confirm each offer when it actually arrives."
        actions={
          <Button asChild variant="outline">
            <Link to="/donate" target="_blank">
              Open public form
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pledged, not yet received" value={money(pledged)} icon={IndianRupee} />
        <StatCard label="Received so far" value={money(collected)} icon={PackageCheck} tone="done" />
        <StatCard label="Goods & time offered" value={inKindOpen} icon={Gift} />
      </div>

      <div className="mt-6">
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : donations.length === 0 ? (
          <EmptyState
            icon={HandHeart}
            title="No donations yet"
            description="Share the public donation link with well-wishers. Their offers arrive here for review."
          />
        ) : (
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
              <TabsTrigger value="accepted">Accepted ({accepted.length})</TabsTrigger>
              <TabsTrigger value="received">Received ({received.length})</TabsTrigger>
              <TabsTrigger value="declined">Declined ({declined.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <DonationTable rows={pending} emptyLabel="Nothing waiting for review." />
            </TabsContent>
            <TabsContent value="accepted">
              <DonationTable rows={accepted} emptyLabel="No accepted offers right now." />
            </TabsContent>
            <TabsContent value="received">
              <DonationTable rows={received} emptyLabel="Nothing received yet." />
            </TabsContent>
            <TabsContent value="declined">
              <DonationTable rows={declined} emptyLabel="No declined offers." />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}

function DonationTable({ rows, emptyLabel }: { rows: Donation[]; emptyLabel: string }) {
  if (rows.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <div className="surface-card mt-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Offer</TableHead>
            <TableHead>Donor</TableHead>
            <TableHead>Received on</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((d) => (
            <TableRow key={d.id}>
              <TableCell><Badge variant="secondary" className="font-mono font-medium">{d.reference}</Badge></TableCell>
              <TableCell>{donationTypeLabels[d.donation_type]}</TableCell>
              <TableCell className="max-w-xs">
                {d.amount != null ? (
                  <span className="font-medium">{money(Number(d.amount))}</span>
                ) : null}
                {d.description ? (
                  <span className="block truncate text-sm text-muted-foreground">
                    {d.description}
                  </span>
                ) : null}
              </TableCell>
              <TableCell>
                {d.donor_name}
                <span className="block text-xs text-muted-foreground">{d.donor_phone}</span>
              </TableCell>
              <TableCell>{new Date(d.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <StatusBadge status={d.status} />
              </TableCell>
              <TableCell className="text-right">
                <DonationReviewDialog donation={d} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
