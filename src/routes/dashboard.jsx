import { Outlet, createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/layout/AppShell";
import { requireSignedIn, AuthGateError } from "@/components/auth/AuthGate";

export const Route = createFileRoute("/dashboard")({
    ssr: false,
    beforeLoad: requireSignedIn,
    errorComponent: AuthGateError,
    component: DashboardLayout,
});

function DashboardLayout() {
    return (
        <AppShell>
            <Outlet />
        </AppShell>
    );
}
