import { useState } from "react";
import { LogIn, Sparkles } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthError } from "@/components/auth/parts";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { Button } from "@/components/ui/button";
import { safeReturnTo } from "@/lib/authReturnTo";
import { useAuth } from "@/lib/AuthContext";
import { firebaseConfigured } from "@/lib/firebase";
import { isDemoMode } from "@/lib/demoMode";

export function LoginPage() {
  const returnTo = safeReturnTo();
  const { signInWithGoogle, continueAsDemo } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const targetPath = !returnTo || returnTo === "/" ? "/dashboard" : returnTo;

  async function handleGoogleSignIn() {
    setError("");
    if (!firebaseConfigured) {
      setError("Firebase Authentication is not configured. Please use 'Continue as demo' or set VITE_FIREBASE_* variables.");
      return;
    }
    setBusy(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        window.location.href = targetPath;
      }
    } catch (err) {
      setBusy(false);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed before completing.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("This domain is not authorized in Firebase Console (Authentication > Settings > Authorized domains).");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error encountered during sign-in. Please check your connection.");
      } else {
        setError(err.message || "Failed to sign in with Google.");
      }
    }
  }

  function handleDemo() {
    continueAsDemo();
    window.location.href = targetPath;
  }

  return (
    <AuthLayout icon={LogIn} title="Welcome to Volsentra" subtitle="Sign in to access your grid command center">
      <AuthError>{error}</AuthError>
      <div className="space-y-3">
        <Button
          type="button"
          className="h-12 w-full text-sm font-medium"
          disabled={busy}
          onClick={handleGoogleSignIn}
        >
          <GoogleIcon className="mr-2 h-5 w-5" />
          {busy ? "Signing in..." : "Continue with Google"}
        </Button>

        {isDemoMode() && (
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full text-sm font-medium border-border/80 hover:bg-foreground/[0.04]"
            disabled={busy}
            onClick={handleDemo}
          >
            <Sparkles className="mr-2 h-4 w-4 text-amber" />
            Continue as demo
          </Button>
        )}
      </div>

      {!firebaseConfigured && (
        <p className="mt-4 text-center text-xs text-ink-faint">
          Firebase not configured: continue as demo is available.
        </p>
      )}
    </AuthLayout>
  );
}
