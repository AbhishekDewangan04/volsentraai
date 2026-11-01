import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { getFirebaseAuth, firebaseConfigured } from "@/lib/firebase";

const DEMO_FLAG_KEY = "gg.demo";
const demoModeEnabled = import.meta.env.VITE_DEMO_MODE === "true";
const DEMO_USER = {
  uid: "demo-guest",
  name: "Guest Analyst",
  email: "demo@volsentra.local",
  photoURL: null,
};

function readDemoFlag() {
  if (!demoModeEnabled || typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DEMO_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

function writeDemoFlag(val) {
  if (typeof window === "undefined") return;
  try {
    if (val) window.localStorage.setItem(DEMO_FLAG_KEY, "1");
    else window.localStorage.removeItem(DEMO_FLAG_KEY);
  } catch {
    // ignore
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Always start with loading: true to ensure exact server/client markup match on hydration
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    let unsubscribe = null;
    let isMounted = true;

    async function initAuth() {
      // 1. Check if user already explicitly opted into demo
      const isDemoSaved = readDemoFlag();

      if (!firebaseConfigured) {
        if (isMounted) {
          if (isDemoSaved) {
            setUser(DEMO_USER);
            setIsDemo(true);
          } else {
            setUser(null);
            setIsDemo(false);
          }
          setLoading(false);
        }
        return;
      }

      try {
        const fb = await getFirebaseAuth();
        if (!fb) {
          if (isMounted) {
            if (isDemoSaved) {
              setUser(DEMO_USER);
              setIsDemo(true);
            }
            setLoading(false);
          }
          return;
        }

        // Handle redirect result if user was redirected from Google auth
        try {
          const redirectRes = await fb.getRedirectResult(fb.auth);
          if (redirectRes?.user && isMounted) {
            writeDemoFlag(false);
            setUser({
              uid: redirectRes.user.uid,
              name: redirectRes.user.displayName || "Google User",
              email: redirectRes.user.email,
              photoURL: redirectRes.user.photoURL,
            });
            setIsDemo(false);
            setLoading(false);
          }
        } catch (err) {
          console.warn("Firebase redirect auth check:", err.message);
        }

        // Listen for auth state changes
        unsubscribe = fb.onAuthStateChanged(fb.auth, (fbUser) => {
          if (!isMounted) return;
          if (fbUser) {
            writeDemoFlag(false);
            setUser({
              uid: fbUser.uid,
              name: fbUser.displayName || "Google User",
              email: fbUser.email,
              photoURL: fbUser.photoURL,
            });
            setIsDemo(false);
          } else {
            if (readDemoFlag()) {
              setUser(DEMO_USER);
              setIsDemo(true);
            } else {
              setUser(null);
              setIsDemo(false);
            }
          }
          setLoading(false);
        });
      } catch (err) {
        console.warn("Firebase auth initialization failed:", err.message);
        if (isMounted) {
          if (isDemoSaved) {
            setUser(DEMO_USER);
            setIsDemo(true);
          }
          setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!firebaseConfigured) {
      throw new Error("Firebase Authentication is not configured.");
    }
    const fb = await getFirebaseAuth();
    if (!fb) {
      throw new Error("Firebase Authentication could not be loaded.");
    }
    const provider = new fb.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const result = await fb.signInWithPopup(fb.auth, provider);
      writeDemoFlag(false);
      const u = {
        uid: result.user.uid,
        name: result.user.displayName || "Google User",
        email: result.user.email,
        photoURL: result.user.photoURL,
      };
      setUser(u);
      setIsDemo(false);
      return u;
    } catch (popupErr) {
      // If popup is blocked or closed by user, fall back to redirect
      if (
        popupErr.code === "auth/popup-blocked" ||
        popupErr.code === "auth/popup-closed-by-user" ||
        popupErr.code === "auth/cancelled-popup-request"
      ) {
        await fb.signInWithRedirect(fb.auth, provider);
        return null;
      }
      throw popupErr;
    }
  };

  const continueAsDemo = () => {
    if (!demoModeEnabled) return null;
    writeDemoFlag(true);
    setUser(DEMO_USER);
    setIsDemo(true);
    return DEMO_USER;
  };

  const signOut = async () => {
    writeDemoFlag(false);
    setUser(null);
    setIsDemo(false);
    if (firebaseConfigured) {
      try {
        const fb = await getFirebaseAuth();
        if (fb) await fb.signOut(fb.auth);
      } catch {
        // ignore sign out errors
      }
    }
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isDemo,
      signInWithGoogle,
      continueAsDemo,
      signOut,
      // Compatibility aliases
      isAuthenticated: !!user,
      isLoadingAuth: loading,
      logout: signOut,
    }),
    [user, loading, isDemo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
