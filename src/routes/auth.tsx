import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { upsertProfile } from "@/lib/cloud";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: search.tab === "signup" ? "signup" : "login",
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Timely Substitution App" },
      {
        name: "description",
        content:
          "Create a Timely account or log in to save your school timetable and daily substitution plans.",
      },
      { property: "og:title", content: "Sign in to Timely" },
      {
        property: "og:description",
        content: "Save your teacher timetable once and generate daily cover in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { tab: initialTab } = Route.useSearch();
  
  const [tab, setTab] = useState<"login" | "signup">(initialTab);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [googleConfigured, setGoogleConfigured] = useState(true);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app", replace: true });
    });
  }, [navigate]);

  const signUp = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName, school_name: schoolName },
        },
      });
      if (err) throw err;
      if (data.session?.user) {
        await upsertProfile(data.session.user.id, { fullName, schoolName });
        navigate({ to: "/app", replace: true });
      } else {
        setNotice("Check your email to confirm your account, then log in.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the account.");
    } finally {
      setBusy(false);
    }
  };

  const logIn = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      navigate({ to: "/app", replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not log in.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/app`,
        },
      });
      if (err) {
        if (err.message?.includes("Unsupported provider") || err.message?.includes("OAuth secret")) {
          setGoogleConfigured(false);
          setError("Google sign-in is not yet configured. Please use email/password authentication for now.");
        } else {
          throw err;
        }
      }
      // Note: On successful OAuth, Supabase will redirect, so this code may not execute
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign-in failed. Please check your Supabase configuration.");
    }
  };

  const forgot = async () => {
    if (!email) {
      setError("Enter your email first, then tap “Forgot password”.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) throw err;
      setNotice("Password reset link sent — check your inbox.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the reset link.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <Link to="/" className="flex items-center justify-center gap-2">
          <Logo size="md" />
          <span className="text-lg font-semibold tracking-tight">Timely</span>
        </Link>

        <section className="panel px-5 py-6">
          <h1 className="text-xl font-semibold tracking-tight">Save your timetable</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            With an account your teacher schedule and saved days come back every morning — you only
            tick who is absent.
          </p>

          <Tabs value={tab} onValueChange={(value) => setTab(value as "login" | "signup")} className="mt-5">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-3 pt-4">
              <Field id="li-email" label="Email">
                <Input
                  id="li-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field id="li-password" label="Password">
                <Input
                  id="li-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <Button className="w-full" disabled={busy} onClick={() => void logIn()}>
                {busy ? <Loader2 className="animate-spin" /> : <LogIn />} Log in
              </Button>
              <button
                type="button"
                onClick={() => void forgot()}
                className="w-full text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Forgot password?
              </button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-3 pt-4">
              <Field id="su-name" label="Your name">
                <Input
                  id="su-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </Field>
              <Field id="su-school" label="School name">
                <Input
                  id="su-school"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  autoComplete="organization"
                />
              </Field>
              <Field id="su-email" label="Email">
                <Input
                  id="su-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field id="su-password" label="Password">
                <Input
                  id="su-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <Button className="w-full" disabled={busy} onClick={() => void signUp()}>
                {busy ? <Loader2 className="animate-spin" /> : <UserPlus />} Create account
              </Button>
            </TabsContent>
          </Tabs>

          {googleConfigured && (
            <>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
              </div>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => void google()}
                disabled={busy}
              >
                Continue with Google
              </Button>
            </>
          )}

          {error && (
            <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {notice && <p className="mt-4 text-sm text-muted-foreground">{notice}</p>}
        </section>

        <p className="text-center text-xs text-muted-foreground">
          <Link to="/app" className="underline-offset-4 hover:underline">
            Continue without an account
          </Link>{" "}
          — your work stays on this device only.
        </p>
      </div>
    </main>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
