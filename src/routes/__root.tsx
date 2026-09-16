import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Timely Substitution App" },
      { name: "description", content: "Automated teacher substitution scheduling for schools." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <div className="animated-bg" aria-hidden="true" style={{ backgroundColor: "#BDEDFD" }}>
          <style>{`
            @keyframes blob1-drift {
              0%, 100% { transform: translate(0, 0); }
              20% { transform: translate(18vw, 12vh); }
              40% { transform: translate(34vw, -4vh); }
              60% { transform: translate(22vw, 22vh); }
              80% { transform: translate(-8vw, 14vh); }
            }

            @keyframes blob2-drift {
              0%, 100% { transform: translate(0, 0); }
              20% { transform: translate(-16vw, -12vh); }
              40% { transform: translate(-30vw, 8vh); }
              60% { transform: translate(-18vw, 26vh); }
              80% { transform: translate(8vw, 18vh); }
            }

            @keyframes blob3-drift {
              0%, 100% { transform: translate(0, 0); }
              20% { transform: translate(12vw, -18vh); }
              40% { transform: translate(-10vw, -28vh); }
              60% { transform: translate(-26vw, -8vh); }
              80% { transform: translate(-4vw, 16vh); }
            }

            .animated-bg .blob-1 {
              animation: blob1-drift 10s ease-in-out infinite;
            }

            .animated-bg .blob-2 {
              animation: blob2-drift 11.5s ease-in-out -7s infinite;
            }

            .animated-bg .blob-3 {
              animation: blob3-drift 9s ease-in-out -14s infinite;
            }
          `}</style>
          <div className="gradient-blob blob-1" />
          <div className="gradient-blob blob-2" />
          <div className="gradient-blob blob-3" />
        </div>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </div>
    </QueryClientProvider>
  );
}
