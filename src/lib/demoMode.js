const demoMode = import.meta.env.VITE_DEMO_MODE === "true"
  || !import.meta.env.VITE_BASE44_APP_ID
  || !import.meta.env.VITE_BASE44_APP_BASE_URL;

export function isDemoMode() {
  return demoMode;
}
