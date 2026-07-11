import Link from "next/link";
import { Reveal } from "./Reveal";
import { ParallaxHero } from "./ParallaxHero";

const features = [
  {
    title: "AI-matched carpools",
    description:
      "Tell us your route and schedule — our AI groups you with other De Anza students headed the same way, not just a 1:1 nearest match.",
    icon: "🚗",
  },
  {
    title: "Free transit fallback",
    description:
      "No carpool match yet? We'll point you to the best VTA bus or light rail route — already free with your student SmartPass.",
    icon: "🚌",
  },
  {
    title: "See your impact",
    description:
      "Every shared ride shows an estimated carbon savings, so you can see the difference riding together makes.",
    icon: "🌱",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-3xl font-extrabold tracking-tight text-red">Ridemates</span>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/login" className="text-slate-600 hover:text-red">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-red px-4 py-2 text-white transition hover:bg-red-light"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <ParallaxHero>
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-6 px-6 py-32">
          <Reveal>
            <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold tracking-wide text-gold-light uppercase">
              Built for De Anza College
            </span>
          </Reveal>
          <Reveal delayMs={100}>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              De Anza is a commuter campus. Getting here shouldn&apos;t mean driving alone.
            </h1>
          </Reveal>
          <Reveal delayMs={200}>
            <p className="max-w-xl text-lg leading-relaxed text-white/80">
              Ridemates uses AI to match students into shared rides based on real route and
              schedule overlap — and falls back to your free VTA SmartPass route when there&apos;s
              no match yet. Less traffic, fewer solo trips, real carbon savings.
            </p>
          </Reveal>
          <Reveal delayMs={300}>
            <Link
              href="/signup"
              className="mt-2 inline-block rounded-full bg-gold px-6 py-3 text-sm font-semibold text-red shadow-lg transition hover:bg-gold-light"
            >
              Sign up with your De Anza email
            </Link>
          </Reveal>
        </div>
      </ParallaxHero>

      <section className="mx-auto w-full max-w-5xl px-6 py-20">
        <div className="grid gap-8 sm:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delayMs={i * 120}>
              <div className="rounded-2xl bg-red/5 p-6 ring-1 ring-red/10">
                <span className="text-2xl">{f.icon}</span>
                <h2 className="mt-3 text-base font-semibold text-slate-900">{f.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <footer className="mt-auto border-t border-red/10 py-8">
        <p className="mx-auto max-w-5xl px-6 text-xs text-slate-500">
          Ridemates · Built for De Anza College students
        </p>
      </footer>
    </div>
  );
}
