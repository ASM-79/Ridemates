"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, logout, type User } from "@/lib/api";

export function AccountView() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | "loading">("loading");

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  if (user === "loading") {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="rounded-2xl bg-red/5 p-6 ring-1 ring-red/10">
        <p className="text-sm text-slate-600">You need to log in to view your account.</p>
        <Link
          href="/login"
          className="mt-3 inline-block rounded-full bg-red px-4 py-2 text-sm font-medium text-white hover:bg-red-light"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-2xl bg-red/5 p-5 ring-1 ring-red/10">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red text-xl font-semibold text-white">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900">{user.name}</p>
          <p className="text-sm text-slate-600">{user.email}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Role</h2>
        <p className="mt-1 text-sm text-slate-700 capitalize">{user.role}</p>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="w-full rounded-md border border-red/30 px-4 py-2 text-sm font-medium text-red transition hover:bg-red/5"
      >
        Log out
      </button>
    </div>
  );
}
