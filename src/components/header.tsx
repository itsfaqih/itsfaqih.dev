import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MagnifyingGlassIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useTheme } from "../hooks/use-theme";

export function Header() {
  const { toggleTheme } = useTheme();
  const openCommandPalette = () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
    );
  };

  // The bar is fixed; past the first few pixels of scroll it gains a solid panel so the page
  // reads cleanly underneath it.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    addEventListener("scroll", update, { passive: true });
    return () => removeEventListener("scroll", update);
  }, []);

  return (
    <div className="arc arc-bar" data-scrolled={scrolled ? "" : undefined}>
      <div className="arc-wrap">
        <header className="arc-header">
          <Link to="/" className="brand" aria-label="Faqih Muntashir, home">
            FAQIH
          </Link>
          <span className="where hide-sm">
            Yogyakarta · <JakartaClock />
          </span>
          <nav aria-label="Main">
            <Link to="/rule-of-thumb" activeProps={{ "aria-current": "page" }}>
              Rule of Thumb
            </Link>
            <Link to="/" hash="work" className="hide-sm" activeOptions={{ includeHash: true }}>
              Experience
            </Link>
            <Link to="/" hash="projects" className="hide-sm" activeOptions={{ includeHash: true }}>
              Projects
            </Link>
          </nav>
          <button
            type="button"
            className="find"
            onClick={openCommandPalette}
            aria-label="Search the site"
          >
            <MagnifyingGlassIcon size={16} weight="bold" />
            <kbd className="hide-sm">⌘K</kbd>
          </button>
          {/* Both icons render; CSS shows the one for the theme the inline script set, so the
              server markup never disagrees with the page. */}
          <button type="button" className="find theme" onClick={(event) => {
              const box = event.currentTarget.getBoundingClientRect();
              toggleTheme({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
            }} aria-label="Switch theme">
            <SunIcon className="to-light" size={16} weight="bold" />
            <MoonIcon className="to-dark" size={16} weight="bold" />
          </button>
          <a className="btn go sm" href="mailto:itsfaqih@gmail.com">
            Email me
          </a>
        </header>
      </div>
    </div>
  );
}

// Kept separate so the 15-second tick re-renders only the clock.
function JakartaClock() {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
    });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  return <time>{time}</time>;
}
