import type { ReactNode } from "react";
import { Outlet, createRootRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "../components/ThemeToggle";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <RootLayout>
      <Outlet />
    </RootLayout>
  );
}

function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      {children}
      <ThemeToggle />
    </>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-8xl font-black mb-4">404</h1>
      <p className="text-2xl mb-8 opacity-70">Page not found</p>
      <Link
        to="/"
        className="px-6 py-3 bg-black text-white rounded-full font-medium hover:opacity-90 transition-opacity"
      >
        Back to Home
      </Link>
    </div>
  );
}
