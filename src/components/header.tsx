import { Link, useLocation } from "@tanstack/react-router";
import {
  HouseIcon,
  FileTextIcon,
  SunIcon,
  MoonIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
} from "@phosphor-icons/react";
import { useTheme } from "../hooks/use-theme";

// ============================================================================
// Header Component
// ============================================================================

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isRuleOfThumbRoot =
    location.pathname === "/rule-of-thumb" || location.pathname === "/rule-of-thumb/";
  const isRuleOfThumbDetail = location.pathname.startsWith("/rule-of-thumb/") && !isRuleOfThumbRoot;

  const showBackButton = isRuleOfThumbRoot || isRuleOfThumbDetail;
  const backPath = isRuleOfThumbDetail ? "/rule-of-thumb" : "/";

  return (
    <>
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="relative">
          {showBackButton && (
            <Link
              to={backPath}
              className="absolute flex items-center justify-center right-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-linear-to-b from-white/40 to-white/30 dark:from-gray-500/40 dark:to-gray-500/30 backdrop-blur-xl border border-gray-500/30 rounded-full size-13 text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 transition-all duration-200"
              aria-label="Go Back"
            >
              <ArrowLeftIcon size={18} />
            </Link>
          )}

          <div className="mx-auto bg-linear-to-b from-white/40 to-white/30 dark:from-gray-500/40 dark:to-gray-500/30 backdrop-blur-xl border border-gray-500/30 rounded-full px-3 py-2 flex items-center justify-center w-fit transition-all duration-300">
            <nav className="flex items-center gap-1 mx-auto">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 transition-all duration-200"
                activeProps={{
                  className:
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-foreground bg-accent",
                }}
              >
                <HouseIcon size={16} />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <Link
                to="/blog"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 transition-all duration-200"
                activeProps={{
                  className:
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-foreground bg-accent",
                }}
              >
                <FileTextIcon size={16} />
                <span className="hidden sm:inline">Blog</span>
              </Link>

              {/* Divider */}
              <div className="w-px h-4 bg-border mx-1" />

              {/* Social Icons */}
              <div className="flex items-center gap-1">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 transition-all duration-200"
                  aria-label="GitHub"
                >
                  <GithubLogoIcon size={18} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 transition-all duration-200"
                  aria-label="LinkedIn"
                >
                  <LinkedinLogoIcon size={18} />
                </a>
                <a
                  href="mailto:hello@faqih.dev"
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 transition-all duration-200"
                  aria-label="Email"
                >
                  <EnvelopeIcon size={18} />
                </a>
              </div>

              {/* Divider */}
              <div className="w-px h-4 bg-border mx-1" />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-[73px]" />
    </>
  );
}
