"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, logout, type User } from "@/lib/api";

const links = [
  { href: "/rides", label: "Ride history", icon: "🕓" },
  { href: "/saved", label: "Saved rides", icon: "⭐" },
  { href: "/account", label: "Account", icon: "👤" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export function NavDrawer() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (open) {
      getCurrentUser().then(setUser);
    }
  }, [open]);

  async function handleLogout() {
    await logout();
    setOpen(false);
    router.push("/");
  }

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-md hover:bg-red/5"
      >
        <span className="h-0.5 w-5 bg-slate-900" />
        <span className="h-0.5 w-5 bg-slate-900" />
        <span className="h-0.5 w-5 bg-slate-900" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[1000]">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute top-0 right-0 flex h-full w-72 flex-col bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-lg font-extrabold text-red">Ridemates</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {user && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-red/5 p-3 ring-1 ring-red/10">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red text-sm font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
            )}

            <nav className="mt-4 flex-1 space-y-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-red/5"
                >
                  <span>{l.icon}</span>
                  {l.label}
                </Link>
              ))}
            </nav>

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-red/30 px-4 py-2 text-sm font-medium text-red hover:bg-red/5"
              >
                Log out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-md bg-red px-4 py-2 text-center text-sm font-medium text-white hover:bg-red-light"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
