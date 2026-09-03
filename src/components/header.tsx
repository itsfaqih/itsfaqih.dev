import { useState } from "react";
import { cx } from "@/stylex";
import { Drawer } from "@base-ui/react/drawer";
import { Link, useLocation } from "@tanstack/react-router";
import {
  HouseIcon,
  SunIcon,
  MoonIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  ListIcon,
} from "@phosphor-icons/react";
import { useTheme } from "../hooks/use-theme";
import { useLiquidGLTarget } from "../hooks/use-liquid-glass";
import { CommandPaletteTrigger } from "./command-palette";

const DESKTOP_NAV_LIQUID_OPTIONS = {
  refraction: 0.018,
  aberration: 0.003,
  bevelDepth: 0.125,
  bevelWidth: 0.2,
  frost: 0.6,
  shadow: false,
  specular: true,
  tilt: false,
};

const DESKTOP_BACK_LIQUID_OPTIONS = {
  tilt: false,
};

const MOBILE_LIQUID_OPTIONS = {
  shadow: false,
  tilt: false,
};

// ============================================================================
// Header Component
// ============================================================================

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  const isRuleOfThumbRoot =
    location.pathname === "/rule-of-thumb" || location.pathname === "/rule-of-thumb/";
  const isRuleOfThumbDetail = location.pathname.startsWith("/rule-of-thumb/") && !isRuleOfThumbRoot;

  const showBackButton = isRuleOfThumbRoot || isRuleOfThumbDetail;
  const backPath = isRuleOfThumbDetail ? "/rule-of-thumb" : "/";
  const desktopNavRef = useLiquidGLTarget<HTMLDivElement>(true, DESKTOP_NAV_LIQUID_OPTIONS);
  const desktopBackRef = useLiquidGLTarget<HTMLDivElement>(true, DESKTOP_BACK_LIQUID_OPTIONS);
  const mobileBackRef = useLiquidGLTarget<HTMLDivElement>(true, MOBILE_LIQUID_OPTIONS);
  const mobileMenuTriggerRef = useLiquidGLTarget<HTMLDivElement>(true, MOBILE_LIQUID_OPTIONS);

  return (
    <>
      <header className={cx("desktop-navigation fixed top-4 left-1/2 -translate-x-1/2 z-50")}>
        <div className={cx("relative")}>
          <div
            ref={desktopBackRef}
            className={cx("liquid-gl-target desktop-menu-back-button", !showBackButton && "liquid-gl-hidden")}
            aria-hidden={!showBackButton}
          >
            <Link
              to={backPath}
              preload="intent"
              className={cx("liquid-gl-content desktop-menu-back-button-content")}
              aria-label="Go Back"
              tabIndex={showBackButton ? 0 : -1}
            >
              <ArrowLeftIcon size={18} />
            </Link>
          </div>

          <div
            ref={desktopNavRef}
            className={cx("liquid-gl-target desktop-menu-surface mx-auto bg-linear-to-b from-white/40 to-white/30 dark:from-gray-500/40 dark:to-gray-500/30 backdrop-blur-xl border border-gray-500/30 rounded-full px-3 py-2 flex items-center justify-center w-fit transition-all duration-300")}
          >
            <nav className={cx("liquid-gl-content flex items-center gap-1 mx-auto")}>
              <Link
                to="/"
                className={cx("flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground active:scale-95 transition-all duration-200")}
                activeProps={{
                  className:
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-foreground bg-accent",
                }}
              >
                <HouseIcon size={16} />
                <span className={cx("hidden sm:inline")}>Home</span>
              </Link>
              {/* Divider */}
              <div className={cx("w-px h-4 bg-border mx-1")} />

              {/* Social Icons */}
              <div className={cx("flex items-center gap-1")}>
                <a
                  href="https://github.com/itsfaqih"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cx("p-2 rounded-lg text-muted-foreground hover:text-foreground active:scale-95 transition-all duration-200")}
                  aria-label="GitHub"
                >
                  <GithubLogoIcon size={18} />
                </a>
                <a
                  href="https://www.linkedin.com/in/itsfaqih"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cx("p-2 rounded-lg text-muted-foreground hover:text-foreground active:scale-95 transition-all duration-200")}
                  aria-label="LinkedIn"
                >
                  <LinkedinLogoIcon size={18} />
                </a>
                <a
                  href="mailto:itsfaqih@gmail.com"
                  className={cx("p-2 rounded-lg text-muted-foreground hover:text-foreground active:scale-95 transition-all duration-200")}
                  aria-label="Email"
                >
                  <EnvelopeIcon size={18} />
                </a>
              </div>

              {/* Divider */}
              <div className={cx("w-px h-4 bg-border mx-1")} />

              {/* Search / Command Palette */}
              <CommandPaletteTrigger />

              {/* Divider */}
              <div className={cx("w-px h-4 bg-border mx-1")} />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={cx("p-2 rounded-lg text-muted-foreground hover:text-foreground active:scale-95 transition-all duration-200")}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
              </button>
            </nav>
          </div>

        </div>
      </header>

      <div
        ref={mobileBackRef}
        className={cx("liquid-gl-target mobile-menu-back-button", !showBackButton && "liquid-gl-hidden")}
        aria-hidden={!showBackButton}
      >
        <Link
          to={backPath}
          preload="intent"
          className={cx("liquid-gl-content mobile-menu-glass-content")}
          aria-label="Go Back"
          tabIndex={showBackButton ? 0 : -1}
        >
          <ArrowLeftIcon size={18} />
        </Link>
      </div>

      <Drawer.Root open={isMenuOpen} onOpenChange={setIsMenuOpen} swipeDirection="down">
        <div ref={mobileMenuTriggerRef} className={cx("liquid-gl-target mobile-menu-trigger")}>
          <Drawer.Trigger
            className={cx("liquid-gl-content mobile-menu-glass-content")}
            aria-label="Open menu"
          >
            <ListIcon size={22} />
          </Drawer.Trigger>
        </div>
        <Drawer.Portal>
          <Drawer.Backdrop className={cx("mobile-menu-backdrop fixed inset-0 z-[60]")} />
          <Drawer.Viewport className={cx("mobile-menu-viewport fixed inset-0 z-[60] flex items-end justify-center pointer-events-none")}>
            <Drawer.Popup
              className={cx("mobile-menu-popup pointer-events-auto w-full max-h-[80dvh] overflow-y-auto rounded-t-3xl border border-border bg-background/95 backdrop-blur-xl px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl outline-none")}
            >
              <Drawer.Content className={cx("mobile-menu-content mx-auto w-full max-w-md")}>
                <div className={cx("mobile-menu-grip mx-auto mb-5 h-1.5 w-12 rounded-full bg-border")} aria-hidden />
                <Drawer.Title className={cx("mobile-menu-title mb-4 text-lg font-bold text-foreground")}>Menu</Drawer.Title>
                <nav className={cx("mobile-menu-list flex flex-col gap-1")} aria-label="Mobile navigation">
                  <Link
                    to="/"
                    onClick={closeMenu}
                    className={cx("mobile-menu-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-base text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all")}
                    activeProps={{
                      className: "mobile-menu-item mobile-menu-item-active",
                    }}
                  >
                    <HouseIcon size={20} />
                    <span>Home</span>
                  </Link>
                  <a
                    href="https://github.com/itsfaqih"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenu}
                    className={cx("mobile-menu-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-base text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all")}
                  >
                    <GithubLogoIcon size={20} />
                    <span>GitHub</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/itsfaqih"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenu}
                    className={cx("mobile-menu-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-base text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all")}
                  >
                    <LinkedinLogoIcon size={20} />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href="mailto:itsfaqih@gmail.com"
                    onClick={closeMenu}
                    className={cx("mobile-menu-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-base text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all")}
                  >
                    <EnvelopeIcon size={20} />
                    <span>Email</span>
                  </a>
                  <div className={cx("mobile-menu-divider my-2 h-px bg-border")} />
                  <CommandPaletteTrigger showLabel onOpen={closeMenu} className="mobile-menu-item" />
                  <button
                    onClick={() => {
                      toggleTheme();
                      closeMenu();
                    }}
                    className={cx("mobile-menu-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-base text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all")}
                  >
                    {theme === "dark" ? <SunIcon size={20} /> : <MoonIcon size={20} />}
                    <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
                  </button>
                </nav>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Spacer */}
      <div className={cx("header-spacer")} />
    </>
  );
}
