import { useCallback, useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";

type Theme = "light" | "dark";

function getSystemTheme(): Theme {
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function getResolvedTheme(): Theme {
	const stored = localStorage.getItem("theme");
	if (stored === "dark" || stored === "light") return stored;
	return getSystemTheme();
}

function applyTheme(theme: Theme) {
	const isDark = theme === "dark";
	document.documentElement.classList.toggle("dark", isDark);
	document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

export function ThemeToggle() {
	const [mounted, setMounted] = useState(false);
	const [resolvedTheme, setResolvedTheme] = useState<Theme>("light");

	const syncTheme = useCallback(() => {
		const theme = getResolvedTheme();
		setResolvedTheme(theme);
		applyTheme(theme);
	}, []);

	useEffect(() => {
		setMounted(true);
		syncTheme();

		// Listen for OS theme changes — only matters when user hasn't
		// explicitly chosen a theme (i.e. "theme" key absent from localStorage)
		const mql = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			if (!localStorage.getItem("theme")) {
				syncTheme();
			}
		};
		mql.addEventListener("change", handleChange);
		return () => mql.removeEventListener("change", handleChange);
	}, [syncTheme]);

	const toggleTheme = () => {
		const next: Theme = resolvedTheme === "dark" ? "light" : "dark";
		localStorage.setItem("theme", next);
		setResolvedTheme(next);
		applyTheme(next);
	};

	if (!mounted) {
		return (
			<button
				className="fixed top-12 right-12 z-50 p-2.5 rounded-full bg-background border border-foreground/10 shadow-sm transition-colors duration-200 cursor-default text-foreground opacity-0 pointer-events-none"
				aria-hidden="true"
			>
				<div className="w-5 h-5" />
			</button>
		);
	}

	return (
		<button
			onClick={toggleTheme}
			className="fixed top-6 right-6 sm:top-12 sm:right-12 p-2.5 rounded-full bg-background border border-foreground/10 shadow-sm hover:bg-foreground/5 transition-colors duration-200 cursor-pointer text-foreground"
			aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
		>
			{resolvedTheme === "dark" ? (
				<SunIcon size={20} weight="duotone" />
			) : (
				<MoonIcon size={20} weight="duotone" />
			)}
		</button>
	);
}
