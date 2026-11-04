import { redirect } from "@tanstack/react-router";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";

export function requireSignedIn({ location }) {
  if (typeof window === "undefined") {
    return;
  }
  const isDemo = window.localStorage.getItem("gg.demo") === "1";
  let hasFirebaseUser = false;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith("firebase:authUser:")) {
        hasFirebaseUser = true;
        break;
      }
    }
  } catch {
    // ignore
  }

  if (isDemo || hasFirebaseUser) {
    return;
  }

  throw redirect({
    to: "/login",
    search: { returnTo: location.href },
    reloadDocument: true,
  });
}

export function AuthGateError({ error }) {
  return <DefaultCatchBoundary error={error} />;
}
