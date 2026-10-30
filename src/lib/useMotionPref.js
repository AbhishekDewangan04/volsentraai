import { useReducedMotion } from "framer-motion";
import { useGrid } from "@/lib/GridContext";

/**
 * True when motion must be reduced — either the OS preference or the app's
 * Settings → Reduced motion switch. Every new effect checks this.
 */
export function useMotionOff() {
    const prefers = useReducedMotion();
    const { settings } = useGrid();
    return Boolean(prefers) || Boolean(settings?.reduced_motion);
}