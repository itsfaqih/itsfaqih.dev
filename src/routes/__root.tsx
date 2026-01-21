import { HeadContent, Scripts, createRootRoute, Link } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import Header from "../components/header";
import GridBackground from "../components/grid-background";
import { cn } from "../cn";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <h1 className="text-2xl font-bold text-(--text-primary)">Page Not Found</h1>
      <Link
        to="/"
        className="text-(--text-secondary) hover:text-(--text-primary) underline decoration-(--border-color) underline-offset-4"
      >
        Go back home
      </Link>
    </div>
  ),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Faqih Muntashir - Developer & Writer" },
      {
        name: "description",
        content:
          "Personal website of Faqih Muntashir - a developer writing about technology, design, and web development.",
      },
      { name: "theme-color", content: "#0a0a0f" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=Geist+Mono:wght@300;400;500;600;700;800&display=swap",
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var support = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var doc = document.documentElement;
                  doc.classList.remove('light', 'dark');
                  if (saved === 'dark' || (!saved && support)) {
                    doc.classList.add('dark');
                  } else {
                    doc.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={cn(
          "m-0 min-h-screen antialiased font-sans overflow-x-hidden relative",
          "bg-(--bg-primary) text-(--text-primary)",
          "transition-colors duration-300",
        )}
      >
        <GridBackground />
        <Header />
        <main className="relative z-10">{children}</main>
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[{ name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> }]}
        />
        <Scripts />
      </body>
    </html>
  );
}
