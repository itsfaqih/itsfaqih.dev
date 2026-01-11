import { Link } from "@tanstack/react-router";
import { Home, FileText, Sun, Moon, Github, Linkedin, Mail } from "lucide-react";
import { useEffect, useState } from "react";

// ============================================================================
// useTheme Hook (inlined - only used here)
// ============================================================================

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme };
}

// ============================================================================
// Header Component
// ============================================================================

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="mx-auto bg-linear-to-b from-gray-500/10 to-gray-500/5 backdrop-blur-xl border border-gray-500/30 rounded-full px-3 py-2 flex items-center justify-center w-fit transition-all duration-300">
          <nav className="flex items-center gap-1 mx-auto">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-95 transition-all duration-200"
              activeProps={{
                className:
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-secondary)]",
              }}
            >
              <Home size={16} />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link
              to="/blog"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-95 transition-all duration-200"
              activeProps={{
                className:
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-secondary)]",
              }}
            >
              <FileText size={16} />
              <span className="hidden sm:inline">Blog</span>
            </Link>

            {/* Divider */}
            <div className="w-px h-4 bg-[var(--border-color)] mx-1" />

            {/* Social Icons */}
            <div className="flex items-center gap-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-95 transition-all duration-200"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-95 transition-all duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="mailto:hello@faqih.dev"
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-95 transition-all duration-200"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>

            {/* Divider */}
            <div className="w-px h-4 bg-[var(--border-color)] mx-1" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-95 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </nav>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-[73px]" />
    </>
  );
}
