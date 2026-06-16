import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/GoogleIcon";
import { useAuth } from "@/context/auth-context";
import { useAuthForm } from "@/hooks/useAuthForm";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { signIn, signInWithGoogle, demoMode } = useAuth();
  const navigate = useNavigate();
  const showGoogle = demoMode || import.meta.env.VITE_ENABLE_GOOGLE === "true";
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/app/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { error, setError, loading, run } = useAuthForm();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return setError("Please enter a valid email address.");
    void run(
      "email",
      async () => {
        await signIn(email.trim(), password);
        navigate(from, { replace: true });
      },
      "Could not sign you in.",
    );
  };

  const google = () => {
    void run(
      "google",
      async () => {
        await signInWithGoogle();
        navigate(from, { replace: true });
      },
      "Google sign-in failed.",
    );
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Pick up where you left off and keep your streak alive."
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
          >
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading !== null}>
          {loading === "email" ? <Loader2 className="size-4 animate-spin" /> : null}
          Log in
        </Button>
      </form>

      {showGoogle && (
        <>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
          <Button variant="outline" className="w-full" onClick={google} disabled={loading !== null}>
            {loading === "google" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <GoogleIcon className="size-[18px]" />
            )}
            Sign in with Google
          </Button>
        </>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Prithvi?{" "}
        <Link to="/signup" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
