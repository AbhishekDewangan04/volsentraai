import { isDemoMode } from "@/lib/demoMode";

let availability;

/** Probe the platform endpoint with fetch so expected unavailable statuses do not get logged by the SDK. */
export function isBackendAvailable() {
  if (isDemoMode() || !import.meta.env.VITE_BASE44_APP_ID) return Promise.resolve(false);
  if (!availability) {
    availability = fetch(`/api/apps/${import.meta.env.VITE_BASE44_APP_ID}/entities/AppSetting/v2/list?limit=1`, {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    }).then((response) => response.ok).catch(() => false);
  }
  return availability;
}
