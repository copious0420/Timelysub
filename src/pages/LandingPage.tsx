import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type MotionStyle,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Coffee,
  Copy,
  ListChecks,
  Plus,
  Scale,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import { Logo } from "@/components/Logo";

/* ------------------------------------------------------------------ */
/*  Tokens & shared styles                                             */
/* ------------------------------------------------------------------ */

const COLORS = {
  bg: "#000000",
  primary: "#1E3A8A",
  secondary: "#60A5FA",
  accent: "#93C5FD",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.5)",
};

const EMAIL = "developerstimely@gmail.com";

const GLASS: CSSProperties = {
  background: "rgba(255, 255, 255, 0.03)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
};

const NOISE =
  "url(\"data:image/svg+xml,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.03'/></svg>\")";

const SPRING = { type: "spring" as const, stiffness: 200, damping: 25 };
const VIEWPORT = { once: true, margin: "-80px" } as const;

// The global stylesheet scales every button/link on hover; opt out where it hurts layout.
const NO_SCALE: CSSProperties = { transform: "none" };

const PAGE_CSS = `
@keyframes tl-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(96,165,250,0.35), 0 0 8px rgba(96,165,250,0.2); }
  50% { box-shadow: 0 0 0 6px rgba(96,165,250,0), 0 0 22px rgba(96,165,250,0.45); }
}
@keyframes tl-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes tl-twinkle {
  0%, 100% { opacity: 0.08; }
  50% { opacity: var(--peak, 1); }
}
@keyframes tl-panel-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.tl-badge { animation: tl-glow 2.4s ease-in-out infinite; }
.tl-marquee-track { animation: tl-marquee 60s linear infinite; }
.tl-panel { animation: tl-panel-in 1.6s ease-out both; }
.tl-px { animation: tl-twinkle var(--dur, 5s) ease-in-out var(--delay, 0s) infinite; }
@media (prefers-reduced-motion: reduce) {
  .tl-badge, .tl-marquee-track, .tl-panel { animation: none; }
  .tl-px { animation: none; opacity: 0.5; }
}
body.tl-cursor, body.tl-cursor * { cursor: none !important; }
`;

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */

const TICKER_FEATURES =
  "Substitution plans in 90 seconds • Fair 4-level assignment • Same-subject matching first • Excel timetable import • One-click override • Print-ready cover schedules • Student portal • No teacher accounts • Free for government schools •";

const PROBLEMS = [
  {
    icon: Clock3,
    title: "Morning chaos",
    copy: "One late message can turn the time before assembly into a rush of calls, lists and last-minute changes.",
  },
  {
    icon: Scale,
    title: "Fairness concerns",
    copy: "Without a clear record, the same available teachers can be chosen again and again.",
  },
  {
    icon: Coffee,
    title: "Teacher burnout",
    copy: "Uneven substitutions take away planning periods and put extra pressure on already busy staff.",
  },
];

const BENEFITS = [
  {
    icon: Clock3,
    label: "Speed",
    stat: "90 seconds",
    copy: "Turn today's absences into a print-ready plan before the first bell.",
  },
  {
    icon: Scale,
    label: "Fairness",
    stat: "Clear choices",
    copy: "Timely checks who is free and spreads substitutions more evenly.",
  },
  {
    icon: Sparkles,
    label: "Simple",
    stat: "No account needed",
    copy: "Open the tool and make a plan. No training or lengthy setup required.",
  },
];

const STEPS = [
  {
    number: "01",
    icon: ListChecks,
    title: "Input absences",
    copy: "Select the teachers and periods that need cover.",
  },
  {
    number: "02",
    icon: Wand2,
    title: "Generate plan",
    copy: "Timely finds free teachers and balances the work.",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Done",
    copy: "Review, adjust if needed, then print or share the plan.",
  },
];

const FAQS = [
  {
    question: "Do teachers need to create accounts?",
    answer:
      "No. Only the admin logs in. Teachers and students never need to touch the app — they just receive the printed or shared plan.",
  },
  {
    question: "Is our school's data secure?",
    answer:
      "Yes. Timely runs in your browser and your data is stored securely in the cloud, tied to your school account only. No other school can access your data.",
  },
  {
    question: "What if I want to override a substitution?",
    answer:
      "Every assignment can be manually overridden with one click using the Override drawer in the dashboard. You're always in control.",
  },
  {
    question: "Is Timely free for government schools?",
    answer:
      "Yes. Timely is free for government schools. No per-teacher fees, no seat charges, no hidden costs.",
  },
  {
    question: "How does the fairness algorithm work?",
    answer:
      "Timely assigns substitutes using a 4-level priority: same subject first, then eligible category (PGT covers TGT/PRT), then the teacher with the lowest substitution load today, then alphabetical as a tiebreaker. No manual guesswork.",
  },
  {
    question: "Can students see their substitution plan?",
    answer:
      "Yes. There's a public student portal protected by a school password set by the admin. Students can check their plan without creating any account.",
  },
];

/* ------------------------------------------------------------------ */
/*  Motion helpers                                                     */
/* ------------------------------------------------------------------ */

function makeReveal(reduced: boolean, y = 40): Variants {
  return {
    hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : y },
    visible: { opacity: 1, y: 0, transition: reduced ? { duration: 0 } : SPRING },
  };
}

function makeStagger(reduced: boolean, gap: number): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: reduced ? 0 : gap } },
  };
}

/* ------------------------------------------------------------------ */
/*  Custom cursor                                                      */
/* ------------------------------------------------------------------ */

function CustomCursor({ reduced }: { reduced: boolean }) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(!window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add("tl-cursor");

    const mouse = { x: -100, y: -100 };
    const ring = { x: -100, y: -100, scale: 1 };
    let targetScale = 1;
    let frame = 0;
    let seen = false;

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!seen) {
        seen = true;
        ring.x = e.clientX;
        ring.y = e.clientY;
        if (dotRef.current) dotRef.current.style.opacity = "1";
        if (ringRef.current) ringRef.current.style.opacity = "1";
      }
      if (dotRef.current)
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      const el = e.target as Element | null;
      targetScale = el?.closest?.("a, button, [role='button']") ? 44 / 28 : 1;
    };
    const onLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
      seen = false;
    };

    const tick = () => {
      const k = reduced ? 1 : 0.1;
      ring.x += (mouse.x - ring.x) * k;
      ring.y += (mouse.y - ring.y) * k;
      ring.scale += (targetScale - ring.scale) * (reduced ? 1 : 0.2);
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) scale(${ring.scale})`;
      }
      frame = requestAnimationFrame(tick);
    };

    document.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    frame = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frame);
      document.body.classList.remove("tl-cursor");
    };
  }, [enabled, reduced]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{
          width: 6,
          height: 6,
          marginLeft: -3,
          marginTop: -3,
          borderRadius: "50%",
          background: COLORS.secondary,
          opacity: 0,
          transition: "opacity 0.2s ease",
        }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9998]"
        style={{
          width: 28,
          height: 28,
          marginLeft: -14,
          marginTop: -14,
          borderRadius: "50%",
          border: "1px solid rgba(96,165,250,0.4)",
          opacity: 0,
          transition: "opacity 0.2s ease",
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Navbar — contracts into a floating pill on scroll                  */
/* ------------------------------------------------------------------ */

const navLinkClass =
  "whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] transition-colors hover:text-white sm:text-sm";

function Navbar({ reduced }: { reduced: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [vw, setVw] = useState(1280);

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 80);
      setVw(window.innerWidth);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const mobile = vw < 640;
  const pillWidth = Math.min(480, vw - 24);
  const transition = reduced ? { duration: 0 } : SPRING;

  const top = {
    width: "100%",
    paddingTop: mobile ? 16 : 24,
    paddingBottom: mobile ? 16 : 24,
    paddingLeft: mobile ? 20 : 48,
    paddingRight: mobile ? 20 : 48,
    marginTop: 0,
    borderRadius: "0px",
    background: "rgba(255, 255, 255, 0)",
    backdropFilter: "blur(0px)",
    WebkitBackdropFilter: "blur(0px)",
    border: "1px solid rgba(255, 255, 255, 0)",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0)",
  };

  const pill = {
    width: pillWidth,
    paddingTop: mobile ? 10 : 12,
    paddingBottom: mobile ? 10 : 12,
    paddingLeft: mobile ? 16 : 24,
    paddingRight: mobile ? 16 : 24,
    marginTop: 16,
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center">
      <motion.header
        initial={false}
        animate={scrolled ? pill : top}
        transition={transition}
        className="pointer-events-auto flex items-center justify-between"
        style={{ boxSizing: "border-box", maxWidth: "100%" }}
      >
        <Link
          to="/"
          aria-label="Timely home"
          className="flex items-center gap-2 text-white"
          style={NO_SCALE}
        >
          <Logo size="sm" />
          <span className="hidden text-base font-semibold tracking-tight min-[400px]:inline">
            Timely
          </span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="Main navigation">
          <Link to="/student" className={navLinkClass} style={{ color: COLORS.muted, ...NO_SCALE }}>
            Student portal
          </Link>
          <Link
            to="/auth"
            search={{ tab: "login" }}
            className={navLinkClass}
            style={{ color: COLORS.muted, ...NO_SCALE }}
          >
            Log in
          </Link>
          <Link
            to="/auth"
            search={{ tab: "signup" }}
            className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium text-white sm:text-sm"
            style={{ background: COLORS.primary, ...NO_SCALE }}
          >
            Sign up
          </Link>
        </nav>
      </motion.header>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pixel panels (hero sides)                                          */
/* ------------------------------------------------------------------ */

const PANEL_LEFT = ["0110", "1100", "1100", "0100", "1110", "1001", "1000", "0110"];
const PANEL_RIGHT = ["0001", "0110", "0011", "0111", "0011", "0101", "0001", "0010"];
const PIXEL_TINTS = [COLORS.primary, COLORS.secondary, COLORS.accent];

// Deterministic pseudo-random so server and client render identical markup.
const rand = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function PixelPanel({
  cells,
  side,
  seed,
}: {
  cells: string[];
  side: "left" | "right";
  seed: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={`tl-panel pointer-events-none absolute top-1/2 z-0 -translate-y-1/2 [--cell:24px] sm:[--cell:40px] lg:[--cell:52px] xl:[--cell:66px] ${
        side === "left" ? "left-0" : "right-0"
      }`}
    >
      <div
        className="grid opacity-50 lg:opacity-100"
        style={{
          gridTemplateColumns: "repeat(4, var(--cell))",
          gridAutoRows: "var(--cell)",
          gap: 0,
        }}
      >
        {cells.flatMap((row, r) =>
          row.split("").map((on, c) => {
            const i = seed + r * 4 + c;
            if (on !== "1") return <span key={i} />;
            const tint = PIXEL_TINTS[Math.floor(rand(i + 1) * PIXEL_TINTS.length)];
            return (
              <span
                key={i}
                className="tl-px relative block overflow-hidden"
                style={
                  {
                    ...GLASS,
                    borderRadius: 0,
                    "--dur": `${(3 + rand(i + 2) * 4).toFixed(2)}s`,
                    "--delay": `${(-rand(i + 3) * 7).toFixed(2)}s`,
                    "--peak": (0.55 + rand(i + 4) * 0.45).toFixed(2),
                  } as CSSProperties
                }
              >
                <span
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${tint}, transparent 80%)`,
                    opacity: 0.6,
                    boxShadow: "inset 0 0 0 1px rgba(147,197,253,0.22)",
                  }}
                />
              </span>
            );
          }),
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

function Hero({ reduced }: { reduced: boolean }) {
  const stagger = makeStagger(reduced, 0.15);
  const item = makeReveal(reduced, 30);
  const pressable = reduced ? {} : { whileHover: { scale: 1.04 }, whileTap: { scale: 0.97 } };

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 38%, rgba(30,58,138,0.35), transparent 70%)",
        }}
      />
      <PixelPanel cells={PANEL_LEFT} side="left" seed={10} />
      <PixelPanel cells={PANEL_RIGHT} side="right" seed={100} />
      <div className="relative z-10 flex flex-1 items-center justify-center px-5 pb-12 pt-28 sm:px-8 sm:pt-32">
        <motion.div
          className="mx-auto w-full max-w-6xl text-center"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={item} className="flex justify-center">
            <span
              className="tl-badge inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white sm:text-sm"
              style={{
                background: "rgba(96,165,250,0.1)",
                border: `1px solid ${COLORS.secondary}`,
              }}
            >
              <Users className="size-4" style={{ color: COLORS.secondary }} /> Built for busy school
              mornings
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mx-auto mt-8 max-w-5xl text-[40px] font-bold leading-[1.08] tracking-tight text-white md:text-[72px] 2xl:text-[88px]"
          >
            Never Scramble for{" "}
            <span
              style={{
                backgroundImage: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              Teacher Substitutes
            </span>{" "}
            Again
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-6 text-base leading-relaxed sm:text-lg 2xl:text-xl"
            style={{ maxWidth: 560, color: "rgba(255,255,255,0.6)" }}
          >
            Generate fair, conflict-free substitution plans in 90 seconds — ready to print, no setup
            needed.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <motion.div {...pressable} transition={SPRING}>
              <Link
                to="/app"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white"
                style={{
                  background: COLORS.primary,
                  boxShadow: "0 0 20px rgba(30,58,138,0.6)",
                  ...NO_SCALE,
                }}
              >
                Launch Dashboard <ArrowRight className="size-4" />
              </Link>
            </motion.div>
            <motion.div {...pressable} transition={SPRING}>
              <a
                href="#how-it-works"
                className="inline-flex items-center rounded-xl px-7 py-3.5 text-sm font-semibold text-white"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  ...NO_SCALE,
                }}
              >
                See How It Works
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      <LogoTicker />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Logo ticker                                                        */
/* ------------------------------------------------------------------ */

function LogoTicker() {
  const mask = "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)";
  const text = (
    <span
      className="flex-none whitespace-nowrap pr-6 text-sm font-medium tracking-wide sm:text-base"
      style={{ color: "rgba(255,255,255,0.3)" }}
    >
      {TICKER_FEATURES}
    </span>
  );
  return (
    <div aria-label="Key features" role="region" className="relative overflow-hidden py-8 sm:py-10">
      <div className="overflow-hidden" style={{ maskImage: mask, WebkitMaskImage: mask }}>
        <div className="tl-marquee-track flex w-max">
          {text}
          <span aria-hidden="true" className="flex">
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section heading                                                    */
/* ------------------------------------------------------------------ */

function SectionHeading({
  eyebrow,
  title,
  copy,
  variants,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  variants: Variants;
}) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      className="mx-auto max-w-2xl text-center"
    >
      <span
        className="text-xs font-medium uppercase tracking-[0.2em]"
        style={{ color: COLORS.secondary }}
      >
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
        {title}
      </h2>
      {copy && (
        <p className="mt-4 text-base leading-relaxed" style={{ color: COLORS.muted }}>
          {copy}
        </p>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature cards (why it matters + benefits)                          */
/* ------------------------------------------------------------------ */

function FeatureCard({
  icon: Icon,
  label,
  title,
  copy,
  reduced,
  variants,
}: {
  icon: typeof Clock3;
  label?: string;
  title: string;
  copy: string;
  reduced: boolean;
  variants: Variants;
}) {
  return (
    <motion.article
      variants={variants}
      {...(reduced
        ? {}
        : {
            whileHover: {
              borderColor: "rgba(96,165,250,0.3)",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(96,165,250,0.1)",
            },
          })}
      style={GLASS as MotionStyle}
      className="p-7"
    >
      <Icon className="size-5" style={{ color: COLORS.secondary }} aria-hidden="true" />
      {label && (
        <p
          className="mt-5 text-xs font-medium uppercase tracking-[0.18em]"
          style={{ color: COLORS.muted }}
        >
          {label}
        </p>
      )}
      <h3 className={`${label ? "mt-1" : "mt-5"} text-xl font-semibold text-white`}>{title}</h3>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: COLORS.muted }}>
        {copy}
      </p>
    </motion.article>
  );
}

function Features({ reduced }: { reduced: boolean }) {
  const reveal = makeReveal(reduced);
  const stagger = makeStagger(reduced, 0.1);
  const grid = "grid gap-5 md:grid-cols-3";

  return (
    <section id="why-it-matters" className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Why this matters"
          title="A calmer start for the whole school"
          copy="When someone is absent, the admin team carries the pressure. Timely helps you act quickly without losing fairness."
          variants={reveal}
        />
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className={`mt-12 ${grid}`}
        >
          {PROBLEMS.map((p) => (
            <FeatureCard
              key={p.title}
              icon={p.icon}
              title={p.title}
              copy={p.copy}
              reduced={reduced}
              variants={reveal}
            />
          ))}
        </motion.div>

        <div className="mt-24">
          <SectionHeading
            eyebrow="Fast, fair, simple"
            title="Less admin. More confidence."
            variants={reveal}
          />
        </div>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className={`mt-12 ${grid}`}
        >
          {BENEFITS.map((b) => (
            <FeatureCard
              key={b.label}
              icon={b.icon}
              label={b.label}
              title={b.stat}
              copy={b.copy}
              reduced={reduced}
              variants={reveal}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  How it works                                                       */
/* ------------------------------------------------------------------ */

function HowItWorks({ reduced }: { reduced: boolean }) {
  const reveal = makeReveal(reduced);
  const stagger = makeStagger(reduced, 0.15);

  return (
    <section id="how-it-works" className="scroll-mt-20 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="How it works"
          title="From absences to a fair plan in three steps"
          variants={reveal}
        />
        <motion.ol
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="mt-16 grid list-none gap-10 p-0 md:grid-cols-3 md:gap-6"
        >
          {STEPS.map((step) => (
            <motion.li key={step.number} variants={reveal} className="relative pt-10">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-2 left-2 select-none font-bold leading-none"
                style={{ fontSize: 120, color: "rgba(255,255,255,0.04)" }}
              >
                {step.number}
              </span>
              <div style={GLASS} className="relative p-7">
                <step.icon
                  className="size-5"
                  style={{ color: COLORS.secondary }}
                  aria-hidden="true"
                />
                <h3 className="mt-5 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: COLORS.muted }}>
                  {step.copy}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Testimonial + support pills                                        */
/* ------------------------------------------------------------------ */

function SupportOptions({ reduced }: { reduced: boolean }) {
  const [open, setOpen] = useState<"feature" | "support" | null>(null);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, []);

  return (
    <div ref={ref} className="mt-6 flex flex-wrap items-start justify-center gap-3">
      {(["feature", "support"] as const).map((type) => {
        const isOpen = open === type;
        return (
          <motion.div
            key={type}
            layout={!reduced}
            transition={reduced ? { duration: 0 } : SPRING}
            style={
              {
                ...GLASS,
                borderRadius: isOpen ? "16px" : "999px",
                overflow: "hidden",
              } as MotionStyle
            }
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : type)}
              aria-expanded={isOpen}
              className="px-5 py-2.5 text-sm font-medium text-white"
              style={NO_SCALE}
            >
              {type === "feature" ? "💬 Suggest a Feature" : "🛠 Get Support"}
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={reduced ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={reduced ? { duration: 0 } : SPRING}
                  className="flex items-center gap-2 overflow-hidden whitespace-nowrap px-5 pb-3 text-xs"
                  style={{ color: COLORS.muted }}
                >
                  <span>{EMAIL}</span>
                  <button
                    type="button"
                    onClick={copyEmail}
                    aria-label="Copy support email"
                    className="grid size-7 flex-none place-items-center rounded-full"
                    style={{
                      background: "rgba(96,165,250,0.12)",
                      color: COLORS.secondary,
                      ...NO_SCALE,
                    }}
                  >
                    <Copy className="size-3.5" />
                  </button>
                  {copied && <span style={{ color: COLORS.accent }}>Copied!</span>}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

function Testimonial({ reduced }: { reduced: boolean }) {
  const reveal = makeReveal(reduced);
  return (
    <section className="px-5 py-24 sm:px-8">
      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        className="mx-auto max-w-3xl"
      >
        <figure style={GLASS} className="m-0 px-8 py-12 text-center sm:px-14">
          <div
            aria-hidden="true"
            className="font-serif leading-none"
            style={{ fontSize: "4rem", color: COLORS.secondary }}
          >
            “
          </div>
          <blockquote className="m-0 text-2xl font-medium leading-snug tracking-tight text-white sm:text-3xl">
            Saves us 30 minutes. Fairness logic means no teacher gets burned out.
          </blockquote>
        </figure>
        <SupportOptions reduced={reduced} />
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */

function Faq({ reduced }: { reduced: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reveal = makeReveal(reduced);
  const stagger = makeStagger(reduced, 0.08);

  return (
    <section className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="Questions school admins ask" variants={reveal} />
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="mt-12 flex flex-col gap-3"
        >
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.article key={faq.question} variants={reveal} style={GLASS as MotionStyle}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-base font-medium text-white"
                  style={NO_SCALE}
                >
                  <span>{faq.question}</span>
                  <motion.span
                    aria-hidden="true"
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={reduced ? { duration: 0 } : SPRING}
                    className="flex-none"
                    style={{ color: COLORS.secondary }}
                  >
                    <Plus className="size-5" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={reduced ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      transition={reduced ? { duration: 0 } : SPRING}
                      className="overflow-hidden"
                    >
                      <p
                        className="px-6 pb-5 pt-4 text-sm leading-relaxed"
                        style={{
                          color: COLORS.muted,
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function Footer() {
  const link = "transition-colors hover:text-white";
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="mx-auto grid max-w-6xl items-center gap-6 px-5 py-10 text-sm sm:px-8 md:grid-cols-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-white md:justify-self-start"
          style={NO_SCALE}
        >
          <Logo size="sm" />
          <span className="font-semibold">Timely</span>
        </Link>
        <a
          href={`mailto:${EMAIL}`}
          className={`${link} md:justify-self-center`}
          style={{ color: COLORS.muted, ...NO_SCALE }}
        >
          {EMAIL}
        </a>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-x-6 gap-y-2 md:justify-self-end"
          style={{ color: COLORS.muted }}
        >
          <Link to="/student" className={link} style={NO_SCALE}>
            Student portal
          </Link>
          <Link to="/auth" search={{ tab: "login" }} className={link} style={NO_SCALE}>
            Log in
          </Link>
          <Link to="/auth" search={{ tab: "signup" }} className={link} style={NO_SCALE}>
            Sign up
          </Link>
        </nav>
      </div>
    </footer>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export function LandingPage() {
  const reduced = useReducedMotion() ?? false;

  return (
    <main
      className="relative min-h-screen overflow-x-clip text-white"
      style={{ background: COLORS.bg }}
    >
      <style>{PAGE_CSS}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{ backgroundImage: NOISE }}
      />
      <CustomCursor reduced={reduced} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "TimelySub",
            alternateName: "Timely",
            url: "https://timelysub.vercel.app/",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description: "Fair, conflict-free teacher substitution planning for schools.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <Navbar reduced={reduced} />
      <div className="relative z-10">
        <Hero reduced={reduced} />
        <Features reduced={reduced} />
        <HowItWorks reduced={reduced} />
        <Testimonial reduced={reduced} />
        <Faq reduced={reduced} />
        <Footer />
      </div>
    </main>
  );
}

export default LandingPage;
