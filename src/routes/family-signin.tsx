import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HeartHandshake, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/family-signin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Family sign in — SAHAAYAK" },
      {
        name: "description",
        content:
          "Relatives of residents can sign in to see their loved one's health updates and upcoming checkups.",
      },
      { property: "og:title", content: "Family sign in — SAHAAYAK" },
      {
        property: "og:description",
        content: "A calm, read-only view of your loved one's care, shared by their care home.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FamilySignInPage,
});

/** Always creates family accounts; never staff. Staff are sent to their dashboard. */
async function finish(fullName: string): Promise<"/family" | "/dashboard"> {
  const { data: role } = await supabase.rpc("ensure_family_account", { _full_name: fullName });
  return role === "admin" || role === "caregiver" ? "/dashboard" : "/family";
}

function FamilySignInPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [existing, setExisting] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setExisting(data.session.user.email ?? "");
    });
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/family-signin`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: await finish(fullName), replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign you in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <HeartHandshake className="size-5 text-primary" aria-hidden />
          SAHAAYAK
        </Link>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="text-center">
            <CardTitle>Family sign in</CardTitle>
            <CardDescription>
              Use the same email you gave on the resident registration form.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {existing !== null ? (
              <div className="space-y-3 text-center">
                <p className="text-sm text-muted-foreground">
                  You are signed in as <span className="font-medium text-foreground">{existing}</span>.
                </p>
                <Button
                  className="w-full"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    navigate({ to: await finish(""), replace: true });
                  }}
                >
                  Continue
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setExisting(null);
                  }}
                >
                  Sign out and use my family email
                </Button>
              </div>
            ) : checkEmail ? (
              <p className="text-center text-sm text-muted-foreground">
                We sent a confirmation link to <span className="font-medium">{email}</span>. Open it
                to finish creating your family account.
              </p>
            ) : (
              <>
                <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signup">Create family account</TabsTrigger>
                    <TabsTrigger value="signin">Sign in</TabsTrigger>
                  </TabsList>
                </Tabs>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="fam-name">Your name</Label>
                      <Input
                        id="fam-name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        autoComplete="name"
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="fam-email">Email from the registration form</Label>
                    <Input
                      id="fam-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fam-password">Password</Label>
                    <Input
                      id="fam-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      minLength={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
                    {mode === "signup" ? "Create family account" : "Sign in"}
                  </Button>
                </form>
              </>
            )}
            <p className="text-center text-xs text-muted-foreground">
              Care home staff?{" "}
              <Link to="/auth" className="underline">
                Staff sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
