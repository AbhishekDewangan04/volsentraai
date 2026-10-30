import { createClient } from "@base44/sdk";
import { getAppParams } from "@/lib/app-params";
import { isDemoMode } from "@/lib/demoMode";

function createNoopNamespace() {
    const method = () => Promise.resolve(undefined);
    return new Proxy(method, {
        get(target, key) {
            if (key === "then") return undefined;
            if (key === "hasToken") return () => false;
            return Reflect.get(target, key) ?? method;
        },
        apply() {
            return Promise.resolve(undefined);
        },
    });
}

function createDemoClient() {
    const namespace = createNoopNamespace();
    return {
        auth: Object.assign(createNoopNamespace(), { hasToken: () => false }),
        entities: namespace,
        integrations: namespace,
        analytics: namespace,
        agents: namespace,
        aiGateway: namespace,
        appLogs: namespace,
        app: namespace,
        actors: namespace,
        connectors: namespace,
        functions: namespace,
        users: namespace,
        payments: namespace,
        cleanup: () => Promise.resolve(undefined),
    };
}

function createBackendClient() {
    const { appId, token, functionsVersion, appBaseUrl } = getAppParams();
    return createClient({ appId, token: token ?? undefined, functionsVersion, serverUrl: "", appBaseUrl });
}

export const base44 = isDemoMode() ? createDemoClient() : createBackendClient();
