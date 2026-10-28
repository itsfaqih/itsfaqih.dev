import { cx } from "@/stylex";
import { HeadContent, Scripts, createRootRoute, Link } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import { Header } from "../components/header";
import { CommandPalette } from "../components/command-palette";
import { PageScrollbar } from "../components/page-scrollbar";
import { FaviconCycle } from "../components/favicon-cycle";
import { PrintCursor } from "../components/print-cursor";
import { SmoothScroll } from "../components/smooth-scroll";
import { THEME_CLASSES } from "../theme";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  notFoundComponent: () => (
    <div className={cx("flex flex-col items-center justify-center min-h-[60vh] space-y-4")}>
      <h1 className={cx("text-2xl font-bold text-foreground")}>Page Not Found</h1>
      <Link
        to="/"
        preload="intent"
        className={cx(
          "text-muted-foreground hover:text-foreground underline decoration-border underline-offset-4",
        )}
      >
        Go back home
      </Link>
    </div>
  ),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Faqih Muntashir" },
      { name: "theme-color", content: "#f5f5f8", media: "(prefers-color-scheme: light)" },
      { name: "theme-color", content: "#0e0e13", media: "(prefers-color-scheme: dark)" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "icon", type: "image/svg+xml", href: "/favicons/favicon.svg" },
      { rel: "apple-touch-icon", href: "/favicons/apple-touch-icon.png" },
      { rel: "stylesheet", href: appCss },
      ...(process.env.NODE_ENV === "development"
        ? [{ rel: "stylesheet", href: "/virtual:stylex.css" }]
        : []),
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
                var doc = document.documentElement;
                doc.classList.add('js');
                // A saved choice wins; otherwise follow the system.
                var theme = 'dark';
                try {
                  var saved = localStorage.getItem('theme');
                  if (saved === 'dark' || saved === 'light') theme = saved;
                  else if (window.matchMedia('(prefers-color-scheme: light)').matches) theme = 'light';
                } catch (e) {}
                var themes = ${JSON.stringify(THEME_CLASSES)};
                doc.classList.remove(...themes.light, ...themes.dark);
                doc.classList.add(...themes[theme]);
                try {
                  // The home intro plays once per session, only when the visit lands on home,
                  // and never under reduced motion.
                  if (
                    location.pathname !== '/' ||
                    sessionStorage.getItem('intro-seen') ||
                    /[?&]nointro/.test(location.search) ||
                    window.matchMedia('(prefers-reduced-motion: reduce)').matches
                  ) {
                    doc.classList.add('no-intro');
                  }
                } catch (e) {
                  doc.classList.add('no-intro');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={cx(
          "m-0 min-h-screen antialiased font-sans overflow-x-hidden relative site-shell",
          "bg-background text-foreground",
        )}
      >
        <Header />
        <CommandPalette />
        <main className={cx("relative z-10")}>{children}</main>
        <PrintCursor />
        <FaviconCycle />
        <SmoothScroll />
        <PageScrollbar />
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[{ name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> }]}
        />
        <Scripts />
      </body>
    </html>
  );
}
