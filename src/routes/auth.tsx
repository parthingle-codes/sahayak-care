import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HeartHandshake, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Staff sign in — SAHAAYAK" },
      {
        name: "description",
        content:
          "Sign in to SAHAAYAK to manage residents, health records and daily care at your elderly care home.",
      },
      { property: "og:title", content: "Staff sign in — SAHAAYAK" },
      {
        property: "og:description",
        content: "Secure access for administrators and caregivers of small elderly care homes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

/** Family accounts land on their read-only portal; staff land on the dashboard. */
async function destinationFor(userId: string): Promise<"/family" | "/dashboard"> {
  // Ensures profile/role rows exist (and auto-links family accounts) on first sign-in.
  await supabase.rpc("ensure_staff_account", { _full_name: "" });
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const list = roles?.map((r) => r.role) ?? [];
  return list.includes("family") && !list.includes("admin") && !list.includes("caregiver")
    ? "/family"
    : "/dashboard";
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active || !data.session) return;
      const to = await destinationFor(data.session.user.id);
      if (active) navigate({ to, replace: true });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
        toast.success("Account created");
        navigate({ to: "/dashboard", replace: true });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back");
      navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign you in");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
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
            <CardTitle>Staff access</CardTitle>
            <CardDescription>
              For administrators and caregivers. Residents do not need an account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {checkEmail ? (
              <div className="space-y-3 text-center">
                <p className="text-sm font-medium text-foreground">Confirm your email</p>
                <p className="text-sm text-muted-foreground">
                  We sent a confirmation link to <span className="font-medium">{email}</span>. Open
                  it to finish creating your staff account.
                </p>
                <Button variant="outline" onClick={() => setCheckEmail(false)} className="w-full">
                  Back to sign in
                </Button>
              </div>
            ) : (
              <>
                <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign in</TabsTrigger>
                    <TabsTrigger value="signup">Create account</TabsTrigger>
                  </TabsList>
                  <TabsContent value="signin" />
                  <TabsContent value="signup" />
                </Tabs>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="full-name">Full name</Label>
                      <Input
                        id="full-name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Sunita Deshmukh"
                        autoComplete="name"
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Work email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@carehome.org"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
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
                    {mode === "signup" ? "Create staff account" : "Sign in"}
                  </Button>
                </form>

                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => void handleGoogle()}
                  disabled={busy}
                >
                  Continue with Google
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  The first account created becomes the care home administrator. Later accounts join
                  as caregivers.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
