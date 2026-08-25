import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  Download,
  Printer,
  Shuffle,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Neev Substitution App — Smart Teacher Cover in Seconds" },
      {
        name: "description",
        content:
          "Neev turns your teacher roster and daily absences into a fair substitution schedule instantly — print it, export it, and keep a history of every day.",
      },
      { property: "og:title", content: "Neev Substitution App" },
      {
        property: "og:description",
        content:
          "Automated substitution scheduling for schools: roster management, absentee tracking and instant cover plans.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Users,
    title: "Living teacher roster",
    body: "Every teacher, their department and their week at a glance — edit inline, no spreadsheet round-trips.",
    points: [
      "Add, rename or remove staff instantly",
      "Toggle Free/Busy for Periods 1–8",
      "Ten demo teachers preloaded",
    ],
  },
  {
    icon: CalendarCheck,
    title: "Daily absentee tracker",
    body: "Pick the date, tick who is away, and mark only the periods that actually need cover.",
    points: [
      "Date-scoped absence log",
      "Per-period selection, not whole days",
      "Busy periods pre-selected for you",
    ],
  },
  {
    icon: Shuffle,
    title: "Fair auto-matching",
    body: "The generator only ever assigns a genuinely free teacher, then keeps the workload even.",
    points: [
      "Same subject/department first",
      "Then lowest substitution count today",
      "Conflicts flagged when nobody is free",
    ],
  },
  {
    icon: Printer,
    title: "Print-ready schedules",
    body: "A staffroom noticeboard table that prints exactly as it looks, in clean black on white.",
    points: ["One-tap browser print", "Save as PDF from the print dialog", "No layout surprises"],
  },
  {
    icon: Download,
    title: "CSV export",
    body: "Take the day's plan anywhere — attendance systems, email, or your own archive.",
    points: ["Period, absentee, subject, substitute", "Opens in Excel or Sheets", "One-click download"],
  },
  {
    icon: Sparkles,
    title: "Saved days",
    body: "Generated plans are stored on your device so yesterday is never lost.",
    points: ["Save any generated day", "Reopen or re-export later", "Delete when it's no longer needed"],
  },
];

const STATS = [
  { k: "8", v: "periods tracked per teacher" },
  { k: "2-step", v: "priority matching logic" },
  { k: "0", v: "spreadsheets required" },
];


const STEPS = [
  { n: "01", t: "Set up the roster", d: "Add teachers, subjects and their free/busy periods." },
  { n: "02", t: "Log the absences", d: "Choose the date and the periods each absentee misses." },
  { n: "03", t: "Generate & share", d: "Press Generate, then print, export or save the day." },
];

function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span className="truncate text-base font-semibold tracking-tight">Neev</span>
          </div>
          <Button asChild size="sm">
            <Link to="/app">
              Open app <ArrowRight />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden px-4 py-16 sm:px-6 sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 size-[42rem] -translate-x-1/2 rounded-full bg-primary/35 blur-3xl animate-float-slow"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-24 -left-24 -z-10 size-[26rem] rounded-full bg-primary/25 blur-3xl animate-pulse-glow"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-64 -z-10 size-[24rem] rounded-full bg-success/20 blur-3xl animate-pulse-glow"
          style={{ animationDelay: "2s" }}
        />

        <div className="mx-auto max-w-3xl text-center">
          <p className="animate-rise inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" /> Automated cover scheduling for schools
          </p>
          <h1
            className="animate-rise mt-6 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl"
            style={{ animationDelay: "80ms" }}
          >
            Never scramble for a{" "}
            <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent text-glow">
              substitute teacher
            </span>{" "}
            again.
          </h1>
          <p
            className="animate-rise mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            Neev reads your roster and today's absences, then builds a fair, conflict-free
            substitution plan in one tap — ready to print, export or save.
          </p>
          <div
            className="animate-rise mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "240ms" }}
          >
            <Button asChild size="lg" className="w-full sm:w-auto hover-scale">
              <Link to="/app">
                Launch the dashboard <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>
        </div>

        {/* Floating mock schedule */}
        <div
          className="animate-rise mx-auto mt-14 max-w-4xl"
          style={{ animationDelay: "320ms" }}
        >
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <p className="truncate text-sm font-semibold">Today's substitution plan</p>
              <span className="shrink-0 rounded-md bg-success/15 px-2 py-1 text-xs font-medium text-success">
                All periods covered
              </span>
            </div>
            <ul className="divide-y divide-border">
              {[
                ["P1", "R. Menon", "Physics", "A. Iyer"],
                ["P3", "S. Kapoor", "History", "M. Das"],
                ["P6", "N. Verma", "Maths", "K. Rao"],
              ].map(([p, absent, subject, sub], i) => (
                <li
                  key={p}
                  className="animate-rise grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-sm"
                  style={{ animationDelay: `${400 + i * 120}ms` }}
                >
                  <span className="shrink-0 rounded-md bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">
                    {p}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{absent}</span>
                    <span className="block truncate text-xs text-muted-foreground">{subject}</span>
                  </span>
                  <span className="shrink-0 text-right text-xs font-medium sm:text-sm">{sub}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <div
              key={s.k}
              className="panel animate-rise px-5 py-5 text-center"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <p className="text-2xl font-semibold text-primary text-glow">{s.k}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Everything a timetable in-charge needs
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Four screens, zero spreadsheets. Built for the ten minutes before the first bell.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <article
                key={f.title}
                className="panel animate-rise px-5 py-5 transition-all duration-200 hover:-translate-y-1 hover:glow-ring"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary glow-ring">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
                <ul className="mt-4 space-y-1.5 border-t border-border pt-4">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span
                        aria-hidden
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                      />
                      <span className="min-w-0">{p}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>


      {/* How it works */}
      <section id="how-it-works" className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li
                key={s.n}
                className="panel animate-rise px-5 py-6"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <p className="text-3xl font-semibold text-primary/30">{s.n}</p>
                <h3 className="mt-2 text-base font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="panel mx-auto max-w-6xl px-6 py-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready for tomorrow morning?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Demo data for ten teachers is already loaded — open the dashboard and generate a plan
            right now.
          </p>
          <Button asChild size="lg" className="mt-7 hover-scale">
            <Link to="/app">
              Open Neev dashboard <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
        Neev Substitution App — smarter cover, every day.
      </footer>
    </div>
  );
}
