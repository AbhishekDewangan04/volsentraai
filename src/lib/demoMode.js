const demoMode = import.meta.env.VITE_DEMO_MODE === "true";

export function isDemoMode() {
  return demoMode;
}

const DEMO_USER_KEY = "volsentra_demo_user";

export const DEMO_GUEST_USER = {
  name: "Guest Analyst",
  email: "demo@volsentra.local",
  role: "analyst",
};

export function getDemoSession() {
  if (typeof window === "undefined") return DEMO_GUEST_USER;
  try {
    const raw = window.localStorage.getItem(DEMO_USER_KEY);
    if (!raw) return DEMO_GUEST_USER;
    return JSON.parse(raw);
  } catch {
    return DEMO_GUEST_USER;
  }
}

export function saveDemoSession(user = DEMO_GUEST_USER) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function clearDemoSession() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DEMO_USER_KEY);
  } catch {
    // ignore
  }
}
