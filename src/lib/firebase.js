/**
 * Firebase Client initialization (Browser only).
 * SSR-safe: imports and initializes only when running in the browser.
 */

const isBrowser = typeof window !== "undefined";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

export const firebaseConfigured = Boolean(
  isBrowser && apiKey && authDomain && projectId && appId
);

let warnedConfig = false;
if (isBrowser && !firebaseConfigured && !warnedConfig) {
  warnedConfig = true;
  console.warn("Firebase Authentication is not configured; running in demo mode.");
}

let firebaseInstance = null;

export async function getFirebaseAuth() {
  if (!firebaseConfigured) return null;
  if (firebaseInstance) return firebaseInstance;

  const { initializeApp, getApps, getApp } = await import("firebase/app");
  const {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    onAuthStateChanged,
    signOut,
  } = await import("firebase/auth");

  const app = getApps().length === 0
    ? initializeApp({
        apiKey,
        authDomain,
        projectId,
        appId,
      })
    : getApp();

  const auth = getAuth(app);
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {
    // Ignore persistence setup errors in restricted contexts
  }

  firebaseInstance = {
    auth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    onAuthStateChanged,
    signOut,
  };

  return firebaseInstance;
}

