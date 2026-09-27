import { useState } from "react";
import { Link2, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFamilyLinks, useLinkFamily, useUnlinkFamily } from "@/features/family/queries";

/**
 * Staff panel on the resident profile: which family accounts can see this
 * resident's updates, plus link-by-email and unlink actions.
 */
export function FamilyAccessCard({ residentId }: { residentId: string }) {
  const { data: links = [], isLoading } = useFamilyLinks(residentId);
  const linkFamily = useLinkFamily(residentId);
  const unlinkFamily = useUnlinkFamily(residentId);
  const [email, setEmail] = useState("");

  async function handleLink(event: React.FormEvent) {
    event.preventDefault();
    try {
      await linkFamily.mutateAsync(email);
      toast.success("Family account linked");
      setEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not link that account");
    }
  }

  async function handleUnlink(linkId: string) {
    try {
      await unlinkFamily.mutateAsync(linkId);
      toast.success("Access removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove access");
    }
  }

  return (
    <section>
      <h2 className="mb-2 font-display text-lg font-semibold">Family access</h2>
      <div className="surface-card space-y-4 p-5">
        <p className="text-sm text-muted-foreground">
          Family members who sign in with the email from the registration form are linked
          automatically. You can also link an existing account by email.
        </p>

        {isLoading ? null : links.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No family linked"
            description="Link a family account so they can follow this resident's updates."
          />
        ) : (
          <ul className="space-y-2">
            {links.map((link) => (
              <li
                key={link.id}
                className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
              >
                <span className="text-muted-foreground">
                  Linked {new Date(link.created_at).toLocaleDateString()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleUnlink(link.id)}
                  disabled={unlinkFamily.isPending}
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleLink} className="flex flex-wrap items-end gap-2">
          <div className="min-w-56 flex-1 space-y-1">
            <Label htmlFor="family-email">Family member's sign-in email</Label>
            <Input
              id="family-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul@gmail.com"
              required
            />
          </div>
          <Button type="submit" disabled={linkFamily.isPending}>
            <Link2 className="size-4" />
            Link account
          </Button>
        </form>
      </div>
    </section>
  );
}
