import * as stylex from "@stylexjs/stylex";
import { palette } from "../theme.stylex";
import { HeadContent, Scripts, createRootRoute, Link } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import { Header } from "../components/header";
import { CommandPalette } from "../components/command-palette";
import { PageScrollbar } from "../components/page-scrollbar";
import { FaviconCycle } from "../components/favicon-cycle";
import { PrintCursor } from "../components/print-cursor";
import { SmoothScroll } from "../components/smooth-scroll";
import { THEME_CLASSES, THEME_COLORS } from "../theme";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  notFoundComponent: () => (
    <div {...stylex.props(styles.notFound)}>
      <h1 {...stylex.props(styles.notFoundTitle)}>Page Not Found</h1>
      <Link to="/" preload="intent" {...stylex.props(styles.homeLink)}>
        Go back home
      </Link>
    </div>
  ),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content",
      },
      { title: "Faqih Muntashir" },
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
        ? [
            { src: "//unpkg.com/react-grab/dist/index.global.js", crossOrigin: "anonymous" },
            // Re-fetches /virtual:stylex.css whenever a newly transformed module (a lazily
            // loaded route, an HMR edit) adds rules; without it the sheet stays as first served.
            { type: "module", src: "/@id/virtual:stylex:css-only" },
          ]
        : [],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...stylex.props(styles.html)} suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Here rather than in head(), which keeps only one meta per name. */}
        <meta
          name="theme-color"
          content={THEME_COLORS.light}
          media="(prefers-color-scheme: light)"
          data-theme="light"
        />
        <meta
          name="theme-color"
          content={THEME_COLORS.dark}
          media="(prefers-color-scheme: dark)"
          data-theme="dark"
        />
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
                // The metas' media queries follow the system, which a saved choice can contradict.
                // Media rather than content changes: React matches the metas by content on hydration.
                document.querySelectorAll('meta[name="theme-color"]').forEach(function(meta) {
                  meta.media = meta.dataset.theme === theme ? 'all' : 'not all';
                });
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
      <body {...stylex.props(styles.body)}>
        <Header />
        <CommandPalette />
        <main {...stylex.props(styles.main)}>{children}</main>
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

const HOVER = "@media (hover: hover) and (pointer: fine)";

const styles = stylex.create({
  notFound: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60svh",
  },
  notFoundTitle: {
    marginBottom: "1rem",
    fontSize: "1.5rem",
    lineHeight: "2rem",
    fontWeight: 700,
  },
  homeLink: {
    color: {
      default: palette["--muted-foreground"],
      ":hover": { default: null, [HOVER]: palette["--text"] },
      ":active": palette["--text"],
    },
    textDecorationLine: "underline",
    textDecorationColor: palette["--border"],
    textUnderlineOffset: "4px",
  },
  html: {
    scrollBehavior: "smooth",
    // Anchored sections land below the fixed header bar.
    scrollPaddingTop: "calc(88px + env(safe-area-inset-top, 0px))",
    overflowX: "clip !important",
  },
  body: {
    position: "relative",
    minHeight: "100svh",
    // Room for the fixed header bar.
    paddingTop: "calc(72px + env(safe-area-inset-top, 0px))",
    // viewport-fit=cover lays the page under a landscape notch; the background still bleeds there.
    paddingLeft: "env(safe-area-inset-left, 0px)",
    paddingRight: "env(safe-area-inset-right, 0px)",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    color: palette["--text"],
    backgroundColor: palette["--bg"],
    overflowX: "clip !important",
    // Diffs resolves its system theme from the rendered body colour scheme.
    colorScheme: { default: "light", ":is(.dark *)": "dark" },
  },
  main: {
    position: "relative",
    zIndex: 10,
  },
});
