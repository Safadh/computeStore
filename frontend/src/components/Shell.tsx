"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { clearToken, getToken, onAuthChanged } from "@/lib/api";
import { useTheme } from "@/components/ThemeProvider";

export function Shell({ children }: { children: React.ReactNode }) {
  const { theme, toggle } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const refresh = () => setIsAuthenticated(!!getToken());
    refresh();
    return onAuthChanged(refresh);
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-slate-100/90 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <span className="text-lg font-semibold tracking-tight">
            compute<span className="text-brand-500">Store</span>
          </span>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1 text-sm">
          <Link
            href="/"
            className="block rounded-md px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            Dashboard
          </Link>
          {isAuthenticated && (
            <Link
              href="/configure"
              className="block rounded-md px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Configure VM
            </Link>
          )}
          <Link
            href="/marketplace"
            className="block rounded-md px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            VM Marketplace
          </Link>
          {isAuthenticated && (
            <>
              <Link
                href="/cart"
                className="block rounded-md px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                Cart
              </Link>
              <Link
                href="/vms"
                className="block rounded-md px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                My VMs
              </Link>
            </>
          )}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="h-16 flex items-center justify-between border-b border-slate-200 bg-slate-100/80 px-4 md:px-8 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="md:hidden font-semibold">
              compute<span className="text-brand-500">Store</span>
            </div>
            <span className="text-xs md:text-sm text-slate-400">
              Configure VM · Marketplace · Monitoring
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <button
              type="button"
              onClick={toggle}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <span>☀️</span> : <span>🌙</span>}
            </button>
            {!isAuthenticated ? (
              <>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  Sign in
                </Link>
                <Link href="/auth/register" className="btn-primary px-3 py-1.5 text-xs">
                  Create account
                </Link>
              </>
            ) : (
              <>
                <span className="hidden md:inline text-slate-500 dark:text-slate-400">
                  Logged in
                </span>
                <button
                  type="button"
                  onClick={() => {
                    clearToken();
                    router.push("/");
                  }}
                  className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8 bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
          {children}
        </div>
      </main>
    </div>
  );
}

