import { cx } from "@/stylex";
import { HeadContent, Scripts, createRootRoute, Link } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import { Header } from "../components/header";
import { GridBackground } from "../components/grid-background";
import { CommandPalette } from "../components/command-palette";
import { cn } from "../cn";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  notFoundComponent: () => (
    <div className={cx("flex flex-col items-center justify-center min-h-[60vh] space-y-4")}>
      <h1 className={cx("text-2xl font-bold text-foreground")}>Page Not Found</h1>
      <Link
        to="/"
        className={cx("text-muted-foreground hover:text-foreground underline decoration-border underline-offset-4")}
      >
        Go back home
      </Link>
    </div>
  ),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Faqih Muntashir - Full Stack Engineer" },
      {
        name: "description",
        content:
          "Personal website of Faqih Muntashir, a full-stack engineer based in Yogyakarta, Indonesia.",
      },
      { name: "theme-color", content: "#0a0a0f" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicons/favicon-black-white.svg" },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicons/favicon-transparent-black.svg",
        media: "(prefers-color-scheme: light)",
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicons/favicon-transparent-white.svg",
        media: "(prefers-color-scheme: dark)",
      },
      { rel: "stylesheet", href: appCss },
      ...(process.env.NODE_ENV === "development"
        ? [{ rel: "stylesheet", href: "/virtual:stylex.css" }]
        : []),
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=Geist+Mono:wght@300;400;500;600;700;800&display=swap",
      },
    ],
    scripts:
      process.env.NODE_ENV === "development"
        ? [{ src: "//unpkg.com/react-grab/dist/index.global.js", crossOrigin: "anonymous" }]
        : [],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cx("scroll-smooth")} suppressHydrationWarning>
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
          "bg-background text-foreground",
          "transition-colors duration-300",
        )}
      >
        <GridBackground />
        <Header />
        <CommandPalette />
        <main className={cx("relative z-10")}>{children}</main>
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[{ name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> }]}
        />
        <Scripts />
      </body>
    </html>
  );
}
