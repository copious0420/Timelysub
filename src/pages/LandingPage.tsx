import { useEffect, useRef, useCallback, useState } from "react";
import {
  motion,
  useReducedMotion,
  type Variants,
  type MotionStyle,
  AnimatePresence,
} from "framer-motion";
import { ArrowRight, Upload, BookOpen, FlaskConical, Pen } from "lucide-react";
import clsx from "clsx";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SubstitutionCard {
  subject: string;
  subjectIcon: typeof BookOpen;
  period: string;
  original: string;
  substitute: string;
  action: string; // "replacing" | "covering"
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const CARDS: SubstitutionCard[] = [
  {
    subject: "Math Dept",
    subjectIcon: BookOpen,
    period: "",
    original: "Ms. Verma",
    substitute: "Mr. Sharma",
    action: "replacing",
  },
  {
    subject: "Science",
    subjectIcon: FlaskConical,
    period: "Period 5",
    original: "Mr. Singh",
    substitute: "Mrs. Patel",
    action: "covering",
  },
  {
    subject: "English",
    subjectIcon: Pen,
    period: "Period 2",
    original: "Mrs. Gupta",
    substitute: "Mr. Kumar",
    action: "covering",
  },
];

/* ------------------------------------------------------------------ */
/*  Glass style (exactly as specified)                                 */
/* ------------------------------------------------------------------ */

const GLASS_STYLE: MotionStyle = {
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.19) 0%, rgba(255,255,255,0.09) 30%, rgba(255,255,255,0.06) 70%, rgba(255,255,255,0.13) 100%)",
  boxShadow:
    "inset 0 1.5px 0 rgba(255,255,255,0.85), inset 0 -1px 0 rgba(255,255,255,0.14), 0 20px 40px rgba(0,0,0,0.15)",
  border: "0.5px solid rgba(255,255,255,0.22)",
  borderRadius: "24px",
};

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const badgeFadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const springHover = {
  scale: 1.05,
  transition: { type: "spring" as const, stiffness: 400, damping: 17 },
};

const springTap = { scale: 0.95 };

/* ------------------------------------------------------------------ */
/*  Custom Cursor Component                                            */
/* ------------------------------------------------------------------ */

function CustomCursor({ disabled }: { disabled: boolean }) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);
  const [visible, setVisible] = useState(false);

  const onMouseMove = useCallback((e: MouseEvent) => {
    mouse.current = { x: e.clientX, y: e.clientY };
    if (dotRef.current) {
      dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }
    setVisible(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    if (disabled) return;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      ringPos.current.x = lerp(ringPos.current.x, mouse.current.x, 0.15);
      ringPos.current.y = lerp(ringPos.current.y, mouse.current.y, 0.15);
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;
      }
      rafId.current = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(rafId.current);
    };
  }, [disabled, onMouseMove, onMouseLeave]);

  if (disabled) return null;

  return (
    <>
      {/* Hide default cursor on this section */}
      <style>{`
        .hero-landing-section, .hero-landing-section * {
          cursor: none !important;
        }
      `}</style>

      {/* Dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999]"
        style={{
          width: 10,
          height: 10,
          marginLeft: -5,
          marginTop: -5,
          borderRadius: "50%",
          backgroundColor: "#60A5FA",
          boxShadow: "0 0 12px 4px rgba(96,165,250,0.6)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      />

      {/* Trailing ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998]"
        style={{
          width: 40,
          height: 40,
          marginLeft: -20,
          marginTop: -20,
          borderRadius: "50%",
          border: "1.5px solid rgba(96,165,250,0.35)",
          boxShadow: "0 0 20px 6px rgba(96,165,250,0.12)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Substitution Preview Card                                          */
/* ------------------------------------------------------------------ */

function SubstitutionPreviewCard({
  card,
  index,
  reducedMotion,
}: {
  card: SubstitutionCard;
  index: number;
  reducedMotion: boolean;
}) {
  const Icon = card.subjectIcon;

  const floatAnimation = reducedMotion
    ? {}
    : {
        y: [-6, 6, -6],
        transition: {
          duration: 4,
          ease: "easeInOut" as const,
          repeat: Infinity,
          delay: index * 0.4,
        },
      };

  return (
    <motion.div
      variants={fadeUp}
      animate={floatAnimation}
      {...(reducedMotion
        ? {}
        : {
            whileHover: {
              scale: 1.02,
              boxShadow:
                "inset 0 1.5px 0 rgba(255,255,255,0.85), inset 0 -1px 0 rgba(255,255,255,0.14), 0 20px 40px rgba(0,0,0,0.15), 0 0 30px rgba(96,165,250,0.4)",
            },
          })}
      style={GLASS_STYLE}
      className="flex flex-col gap-3 p-5 transition-shadow"
    >
      {/* Top row: badges */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Subject badge */}
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
          style={{
            backgroundColor: "rgba(30,58,138,0.12)",
            color: "#1E3A8A",
          }}
        >
          <Icon className="size-3.5" />
          {card.subject}
        </span>

        {/* Period badge (if present) */}
        {card.period && (
          <span
            className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{
              backgroundColor: "rgba(96,165,250,0.18)",
              color: "#1E3A8A",
            }}
          >
            {card.period}
          </span>
        )}
      </div>

      {/* Arrow + teacher names */}
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-medium"
            style={{ color: "#64748b" }}
          >
            {card.original}
          </p>
        </div>

        <div
          className="flex size-8 flex-none items-center justify-center rounded-full"
          style={{
            backgroundColor: "rgba(96,165,250,0.2)",
          }}
        >
          <ArrowRight className="size-4" style={{ color: "#1E3A8A" }} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-bold"
            style={{ color: "#1E3A8A" }}
          >
            {card.substitute}
          </p>
        </div>
      </div>

      {/* Action label */}
      <p className="text-xs" style={{ color: "#64748b" }}>
        {card.substitute} {card.action} {card.original}
      </p>
    </motion.div>
  );
}

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */

export function LandingPage() {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;

  /* Touch device detection for cursor */
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    setIsTouchDevice(
      "ontouchstart" in window || navigator.maxTouchPoints > 0,
    );
  }, []);

  const showCursor = !reducedMotion && !isTouchDevice;

  /* Wrapper variants — skip animation when reduced motion preferred */
  const container = reducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : staggerContainer;

  const item = reducedMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : fadeUp;

  const badge = reducedMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : badgeFadeUp;

  return (
    <section
      className={clsx(
        "hero-landing-section relative z-10 overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:py-32",
      )}
    >
      <CustomCursor disabled={!showCursor} />

      <motion.div
        className="mx-auto max-w-7xl"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* ——— 1. Hero Badge ——— */}
        <motion.div variants={badge} className="flex justify-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
            style={{
              color: "#1E3A8A",
              background: "rgba(255,255,255,0.22)",
              backdropFilter: "blur(16px) saturate(160%)",
              border: "1px solid rgba(96,165,250,0.45)",
              boxShadow:
                "0 0 16px rgba(96,165,250,0.35), 0 0 40px rgba(96,165,250,0.15), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            ⚡ Automated School Timetable Substitution
          </span>
        </motion.div>

        {/* ——— 2. Headline + Subtitle ——— */}
        <motion.h1
          variants={item}
          className="mx-auto mt-8 max-w-4xl text-center text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          style={{ color: "#0f172a" }}
        >
          Never Scramble for{" "}
          <span
            style={{
              backgroundImage: "linear-gradient(135deg, #1E3A8A, #60A5FA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Teacher Substitutes
          </span>{" "}
          Again
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed sm:text-lg"
          style={{ color: "#475569" }}
        >
          TimelySub automatically handles absent teacher schedules, imports
          .xlsx timetables seamlessly, and generates fair substitution
          assignments in seconds.
        </motion.p>

        {/* ——— 3. CTA Buttons ——— */}
        <motion.div
          variants={item}
          className="mx-auto mt-10 flex max-w-xl flex-col items-center justify-center gap-4 sm:flex-row"
        >
          {/* Primary CTA */}
          <motion.button
            {...(reducedMotion ? {} : { whileHover: springHover, whileTap: springTap })}
            className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-white shadow-lg"
            style={{
              backgroundColor: "#1E3A8A",
              boxShadow:
                "0 8px 24px rgba(30,58,138,0.35), 0 0 0 1px rgba(96,165,250,0.12)",
            }}
          >
            Launch Live Timetable
            <ArrowRight className="size-4" />
          </motion.button>

          {/* Secondary CTA (ghost) */}
          <motion.button
            {...(reducedMotion ? {} : { whileHover: springHover, whileTap: springTap })}
            className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold"
            style={{
              color: "#1E3A8A",
              background: "rgba(255,255,255,0.25)",
              backdropFilter: "blur(16px) saturate(160%)",
              border: "1px solid rgba(30,58,138,0.18)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.5), 0 4px 16px rgba(0,0,0,0.06)",
            }}
          >
            <Upload className="size-4" />
            Import .xlsx Timetable
          </motion.button>
        </motion.div>

        {/* ——— 4. Substitution Preview Cards ——— */}
        <motion.div
          variants={item}
          className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {CARDS.map((card, i) => (
              <SubstitutionPreviewCard
                key={card.subject}
                card={card}
                index={i}
                reducedMotion={reducedMotion}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default LandingPage;
