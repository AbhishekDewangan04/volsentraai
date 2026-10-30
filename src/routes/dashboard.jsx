import { Outlet, createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/layout/AppShell";

export const Route = createFileRoute("/dashboard")({
    ssr: false,
    component: DashboardLayout,
});

function DashboardLayout() {
    return (
        <AppShell>
            <Outlet />
        </AppShell>
    );
}