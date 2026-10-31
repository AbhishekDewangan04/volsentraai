import { readFileSync } from "node:fs";
import base44 from "@base44/vite-plugin";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";

// Every runtime dependency is bundled at startup, for the browser and the SSR worker: one first imported
// mid-session makes Vite re-bundle, and a page rendered meanwhile on the server loads a second React.
// Not listed: React itself, the TanStack Start/Router framework (its plugin bundles it) and build-time plugins.
const NOT_PREBUNDLED = new Set(["react", "react-dom", "@base44/vite-plugin", "@tanstack/react-start", "@tanstack/react-router", "@tanstack/react-router-ssr-query", "tailwindcss-animate"]);
const { dependencies } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
const PREBUNDLE = Object.keys(dependencies).filter((name) => !NOT_PREBUNDLED.has(name));

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const demoMode = env.VITE_DEMO_MODE === "true"
        || !env.VITE_BASE44_APP_ID
        || !env.VITE_BASE44_APP_BASE_URL;

    const isBuild = command === "build";

    return {
    optimizeDeps: { include: PREBUNDLE },
    ...(isBuild ? {
        environments: {
            ssr: {
                build: {
                    rolldownOptions: {
                        external: ["cloudflare:workers"],
                    },
                },
            },
        },
    } : {
        environments: {
            ssr: {
                optimizeDeps: { include: PREBUNDLE },
                build: { sourcemap: true, rolldownOptions: { output: { sourcemapExcludeSources: true } } },
            },
        },
    }),
    plugins: [
        base44({
            hmrNotifier: !demoMode,
            navigationNotifier: !demoMode,
            analyticsTracker: !demoMode,
            visualEditAgent: !demoMode,
        }),
        !isBuild && cloudflare({ viteEnvironment: { name: "ssr" }, inspectorPort: false }),
        tanstackStart({ srcDirectory: "src" }),
        isBuild && nitro({
            preset: "vercel",
            rollupConfig: {
                external: ["cloudflare:workers"],
            },
        }),
        react(),
    ].filter(Boolean),
    };
});
