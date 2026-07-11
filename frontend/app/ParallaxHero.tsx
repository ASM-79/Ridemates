"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function ParallaxHero({ children }: { children: ReactNode }) {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (bgRef.current) {
          bgRef.current.style.transform = `translateY(${window.scrollY * 0.35}px)`;
        }
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div
        ref={bgRef}
        className="absolute inset-0 -top-24 h-[calc(100%+6rem)] bg-cover bg-center"
        style={{ backgroundImage: "url('/campus-hero.webp')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-red/70 to-red/95" />
      <div className="relative">{children}</div>
    </section>
  );
}
