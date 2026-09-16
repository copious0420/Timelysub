import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CalendarCheck, Check, Download, Printer, Shuffle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Timely Substitution App — Smart Teacher Cover in Seconds" },
      {
        name: "description",
        content:
          "Timely turns your teacher schedule and daily absences into a fair substitution schedule instantly — print it, export it, and keep a history of every day.",
      },
      { property: "og:title", content: "Timely Substitution App" },
      {
        property: "og:description",
        content:
          "Automated substitution scheduling for schools: schedule management, absentee tracking and instant cover plans.",
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
    title: "Living teacher schedule",
    body: "Every teacher, their department and their week at a glance — edit inline, no spreadsheet round-trips.",
    points: [
      "Add, rename or remove staff instantly",
      "Toggle Free/Busy for Periods 1–8",
      "Import a full timetable from Excel, Google Sheets or CSV",
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
    points: [
      "Period, absentee, subject, substitute",
      "Opens in Excel or Sheets",
      "One-click download",
    ],
  },
  {
    icon: Check,
    title: "Saved days",
    body: "Generated plans are stored on your device so yesterday is never lost.",
    points: [
      "Save any generated day",
      "Reopen or re-export later",
      "Delete when it's no longer needed",
    ],
  },
];

const STATS = [
  { k: "8", v: "periods tracked per teacher" },
  { k: "2-step", v: "priority matching logic" },
  { k: "0", v: "spreadsheets required" },
];

const STEPS = [
  { n: "01", t: "Set up the schedule", d: "Add teachers, subjects and their free/busy periods." },
  { n: "02", t: "Log the absences", d: "Choose the date and the periods each absentee misses." },
  { n: "03", t: "Generate & share", d: "Press Generate, then print, export or save the day." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const viewportConfig = { once: true, margin: "-80px" };

function Landing() {
  const { scrollY } = useScroll();
  const navbarBlur = useTransform(scrollY, [0, 60], [0, 1]);

  return (
    <div className="landing-page min-h-screen overflow-x-hidden">
      {/* Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="landing-navbar sticky top-0 z-30"
        style={{ "--navbar-blur": navbarBlur } as never}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Logo size="md" />
            <span className="truncate text-base font-semibold tracking-tight text-foreground">Timely</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost" className="text-foreground hover:bg-white/50 hover:text-foreground">
              <Link to="/student">Student Portal</Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="landing-nav-btn text-foreground hover:bg-white/50 hover:text-foreground"
            >
              <Link to="/auth" search={{ tab: "login" }}>Log in</Link>
            </Button>
            <Button asChild size="sm" className="landing-nav-btn-primary hover:bg-primary/90">
              <Link to="/auth" search={{ tab: "signup" }}>Sign up</Link>
            </Button>
            <Button asChild size="sm" className="landing-nav-btn-primary hover:bg-primary/90">
              <Link to="/app">Open app <ArrowRight /></Link>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden px-4 py-16 sm:px-6 sm:py-24">
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <span className="glass-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-foreground">
              <Check className="size-3.5 text-primary" /> Automated cover scheduling for schools
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          >
            Never scramble for a <span className="text-primary text-glow">substitute</span>{" "}
            <span className="text-primary text-glow">teacher</span> again.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg lg:text-xl"
          >
            Timely reads your schedule and today's absences, then builds a fair, conflict-free
            substitution plan in one tap — ready to print, export or save.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg" className="landing-cta-btn w-full sm:w-auto">
              <Link to="/app">Launch the dashboard <ArrowRight /></Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="glass-pill w-full sm:w-auto"
            >
              <a href="#how-it-works">See how it works</a>
            </Button>
          </motion.div>
        </div>

        {/* Differentiators */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          transition={{ duration: 0.6, staggerChildren: 0.15 }}
          className="mx-auto mt-14 max-w-7xl"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { k: "No accounts needed", v: "Open the dashboard and start scheduling right away — no sign-up, no setup delays." },
              { k: "Works in the browser", v: "Everything runs locally on your device, so your staff data never leaves the school." },
              { k: "Built for the bell", v: "Generate, print and export a fair cover plan in under a minute — even on the busiest mornings." },
            ].map((item, i) => (
              <motion.div
                key={item.k}
                variants={fadeUp}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="glass-card px-5 py-5 text-center"
              >
                <p className="text-base font-semibold text-primary text-glow">{item.k}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.v}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        transition={{ duration: 0.6, staggerChildren: 0.15 }}
        className="px-4 sm:px-6"
      >
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <motion.div
              key={s.k}
              variants={fadeUp}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="glass-card px-5 py-5 text-center"
            >
              <p className="text-2xl font-semibold text-primary text-glow">{s.k}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.v}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        transition={{ duration: 0.6, staggerChildren: 0.15 }}
        className="px-4 py-16 sm:px-6"
      >
        <div className="mx-auto max-w-7xl">
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-2xl font-semibold tracking-tight text-glow sm:text-3xl lg:text-4xl"
          >
            Everything a timetable in-charge needs
          </motion.h2>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-2 max-w-2xl text-muted-foreground"
          >
            Four screens, zero spreadsheets. Built for the ten minutes before the first bell.
          </motion.p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.article
                key={f.title}
                variants={fadeUp}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="glass-card rounded-xl px-5 py-5"
              >
                <span className="feature-icon grid size-10 place-items-center rounded-xl">
                  <f.icon className="size-5 text-primary" />
                </span>
                <h3 className="mt-4 text-base font-semibold lg:text-lg">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground lg:text-base">{f.body}</p>
                <ul className="mt-4 space-y-1.5 border-t border-border pt-4">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground lg:text-base">
                      <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-secondary" />
                      <span className="min-w-0">{p}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How it works */}
      <motion.section
        id="how-it-works"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        transition={{ duration: 0.6, staggerChildren: 0.15 }}
        className="px-4 py-16 sm:px-6"
      >
        <div className="mx-auto max-w-7xl">
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-2xl font-semibold tracking-tight text-glow sm:text-3xl lg:text-4xl"
          >
            How it works
          </motion.h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.li
                key={s.n}
                variants={fadeUp}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="glass-card px-5 py-6"
              >
                <p className="text-3xl font-semibold text-secondary/30">{s.n}</p>
                <h3 className="mt-2 text-base font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        transition={{ duration: 0.6 }}
        className="px-4 pb-20 sm:px-6"
      >
        <div className="glass-card mx-auto max-w-7xl px-6 py-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-glow sm:text-3xl lg:text-4xl">
            Ready for tomorrow morning?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Set up your schedule, log today's absentees, and generate a fair cover plan in seconds.
          </p>
          <Button asChild size="lg" className="landing-cta-btn mt-7">
            <Link to="/app">Open Timely dashboard <ArrowRight /></Link>
          </Button>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        transition={{ duration: 0.6 }}
        className="border-t border-border px-4 py-10 sm:px-6"
      >
        <div className="mx-auto grid max-w-7xl gap-8 text-sm text-muted-foreground sm:grid-cols-3">
          <div>
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <Logo size="sm" /> Timely
            </p>
            <p className="mt-2">Smarter cover, every day.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Developed by</p>
            <p className="mt-2">Team Aeronics</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Support</p>
            <a href="mailto:developerstimely@gmail.com" className="mt-2 block hover:text-foreground">
              developerstimely@gmail.com
            </a>
            <Link to="/student" className="mt-2 block font-medium text-primary hover:underline">
              Student Portal
            </Link>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-6xl text-center text-xs text-muted-foreground">
          Timely Substitution App — Automated teacher substitution scheduling for schools.
        </p>
      </motion.footer>
    </div>
  );
}
