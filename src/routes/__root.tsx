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
import { THEME_CLASSES } from "../theme";

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
    <html lang="en" {...stylex.props(styles.html)} suppressHydrationWarning>
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
      <body className={`site-shell ${stylex.props(styles.body).className}`}>
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

const styles = stylex.create({
  notFound: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
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
      ":hover": { default: null, "@media (hover: hover)": palette["--text"] },
    },
    textDecorationLine: "underline",
    textDecorationColor: palette["--border"],
    textUnderlineOffset: "4px",
  },
  html: {
    scrollBehavior: "smooth",
  },
  body: {
    position: "relative",
    minHeight: "100vh",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    color: palette["--text"],
    backgroundColor: palette["--bg"],
  },
  main: {
    position: "relative",
    zIndex: 10,
  },
});
