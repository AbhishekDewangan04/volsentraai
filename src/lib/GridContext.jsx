import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getSettings, saveSettings, setApiBase } from "@/lib/gridService";

const DEFAULTS = {
  key: "default",
  risk_threshold: 55,
  notify: true,
  reduced_motion: false,
  api_base_url: "",
};

export const INJECT_MAP = {
  theft: "Theft/Tampering",
  meter: "Meter Fault",
  comms: "Communication Failure",
  legit: "Legit Abnormal",
  reset: "Normal",
};

const GridContext = createContext(null);

/**
 * Shared command-center state: the consumer selected anywhere (3D view, report,
 * cases), scenario injections from the live monitor, and the saved settings.
 */
export function GridProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [settingsId, setSettingsId] = useState(null);
  const [overrides, setOverrides] = useState({});
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [focusTransformer, setFocusTransformer] = useState(null);

  useEffect(() => {
    let alive = true;
    getSettings()
      .then((s) => {
        if (!alive) return;
        const { id, ...rest } = s;
        setSettings({ ...DEFAULTS, ...rest });
        setSettingsId(id ?? null);
        setApiBase(rest.api_base_url);
      })
      .catch(() => { });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("reduce-motion", !!settings.reduced_motion);
  }, [settings.reduced_motion]);

  const updateSettings = useCallback(
    async (patch) => {
      setSettings((s) => ({ ...s, ...patch }));
      if ("api_base_url" in patch) setApiBase(patch.api_base_url);
      try {
        const saved = await saveSettings(settingsId, patch);
        if (saved?.id) setSettingsId(saved.id);
      } catch {
        /* demo settings stay local if the write is refused */
      }
    },
    [settingsId],
  );

  const injectScenario = useCallback((consumer, type) => {
    const cause = INJECT_MAP[type] ?? "Normal";
    setOverrides((prev) => ({ ...prev, [consumer.consumer_id]: cause }));
    setLiveAlerts((prev) =>
      [
        {
          id: `live-${consumer.consumer_id}-${Date.now()}`,
          consumer_id: consumer.consumer_id,
          cause,
          title: `${cause === "Normal" ? "Signal restored" : cause} · ${consumer.consumer_id}`,
          detail:
            cause === "Normal"
              ? "Consumer returned to its peer band after reset."
              : `Injected ${type} scenario on ${consumer.feeder} · ${consumer.transformer_id}.`,
          at: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 40),
    );
    toast[cause === "Normal" ? "success" : "warning"](`${consumer.consumer_id} → ${cause}`, {
      description: cause === "Normal" ? "Stream reset to baseline behaviour." : "Alert raised and the 3D grid recoloured this meter.",
    });
  }, []);

  const effectiveCause = useCallback((consumer) => overrides[consumer?.consumer_id] ?? consumer?.cause, [overrides]);

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      overrides,
      liveAlerts,
      injectScenario,
      effectiveCause,
      selectedId,
      setSelectedId,
      focusTransformer,
      setFocusTransformer,
    }),
    [settings, updateSettings, overrides, liveAlerts, injectScenario, effectiveCause, selectedId, focusTransformer],
  );

  return <GridContext.Provider value={value}>{children}</GridContext.Provider>;
}

export function useGrid() {
  const ctx = useContext(GridContext);
  if (!ctx) throw new Error("useGrid must be used inside GridProvider");
  return ctx;
}