"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, type User } from "@/lib/api";
import { LandingContent } from "./LandingContent";
import { DashboardHome } from "./DashboardHome";

export default function Home() {
  const [user, setUser] = useState<User | null | "loading">("loading");

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  if (user === "loading") {
    return <div className="min-h-screen bg-white" />;
  }

  if (user) {
    return <DashboardHome viewer={user} />;
  }

  return <LandingContent />;
}
