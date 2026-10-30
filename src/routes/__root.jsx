import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { ThemeProvider } from "@/lib/ThemeContext";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/AuthContext";
import { GridProvider } from "@/lib/GridContext";
import { LangProvider } from "@/lib/i18n";
import { Base44Scripts } from "base44:document";
import appCss from "@/index.css?url";

export const Route = createRootRoute({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            { title: "Volsentra AI · Electricity theft & anomaly command center" },
            {
                name: "description",
                content:
                    "Volsentra AI scores every smart meter, explains why it was flagged, ranks field inspections and watches a live meter stream for a power distribution utility.",
            },
            { name: "theme-color", content: "#05060F" },
        ],
        links: [
            { rel: "preconnect", href: "https://fonts.googleapis.com" },
            { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
            {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
            },
            { rel: "stylesheet", href: appCss },
        ],
    }),
    errorComponent: DefaultCatchBoundary,
    notFoundComponent: () => <NotFound />,
    shellComponent: RootDocument,
    component: RootComponent,
});

function RootComponent() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <LangProvider>
                    <GridProvider>
                        <Outlet />
                        <Toaster />
                    </GridProvider>
                </LangProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

function RootDocument({ children }) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <head>
                <HeadContent />
            </head>
            <body data-react-root="true">
                {children}
                <Base44Scripts />
                <Scripts />
            </body>
        </html>
    );
}