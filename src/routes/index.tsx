import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Clock3,
  Coffee,
  Copy,
  Scale,
  Sparkles,
  Users,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TimelySub — Fair Teacher Substitution Plans in 90 Seconds" },
      {
        name: "description",
        content:
          "TimelySub helps schools generate fair, conflict-free teacher substitution plans in 90 seconds. Simple, print-ready cover schedules for busy school mornings.",
      },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:title", content: "TimelySub — Substitute Plans Without the Morning Scramble" },
      {
        property: "og:description",
        content: "A fast, fair and simple way for school admins to arrange teacher substitutions with TimelySub.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://timelysub.vercel.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://timelysub.vercel.app/" }],
  }),
  component: Landing,
});

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const viewport = { once: true, amount: 0.18 };

const problems = [
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

const benefits = [
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

const steps = [
  { number: "01", title: "Input absences", copy: "Select the teachers and periods that need cover." },
  { number: "02", title: "Generate plan", copy: "Timely finds free teachers and balances the work." },
  { number: "03", title: "Done", copy: "Review, adjust if needed, then print or share the plan." },
];

const faqs = [
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
    answer: "Yes. Timely is free for government schools. No per-teacher fees, no seat charges, no hidden costs.",
  },
  {
    question: "How does the fairness algorithm work?",
    answer: "Timely assigns substitutes using a 4-level priority: same subject first, then eligible category (PGT covers TGT/PRT), then the teacher with the lowest substitution load today, then alphabetical as a tiebreaker. No manual guesswork.",
  },
  {
    question: "Can students see their substitution plan?",
    answer: "Yes. There's a public student portal protected by a school password set by the admin. Students can check their plan without creating any account.",
  },
];

function useCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const desktopPointer = window.matchMedia("(pointer: fine)");
    if (!desktopPointer.matches) return;

    document.body.classList.add("landing-cursor-active");

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let frame = 0;

    const move = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    };
    const animate = () => {
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      frame = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", move);
    frame = requestAnimationFrame(animate);
    return () => {
      document.removeEventListener("mousemove", move);
      cancelAnimationFrame(frame);
      document.body.classList.remove("landing-cursor-active");
    };
  }, []);

  return { dotRef, ringRef };
}

function CustomCursor() {
  const { dotRef, ringRef } = useCursor();
  return (
    <>
      <div ref={dotRef} className="timely-cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="timely-cursor-ring" aria-hidden="true" />
    </>
  );
}

function SupportOptions() {
  const [open, setOpen] = useState<"feature" | "support" | null>(null);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const copyEmail = async () => {
    await navigator.clipboard.writeText("developerstimely@gmail.com");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={containerRef} className="support-options">
      {(["feature", "support"] as const).map((type) => {
        const isOpen = open === type;
        const label = type === "feature" ? "💬 Suggest a Feature" : "🛠 Get Support";
        return (
          <motion.div key={type} layout className={isOpen ? "glass support-option support-option-open" : "support-option"}>
            <button type="button" className="support-pill" onClick={() => setOpen(isOpen ? null : type)} aria-expanded={isOpen}>
              {label}
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="support-card-content">
                  <span>Email us at developerstimely@gmail.com</span>
                  <button type="button" onClick={copyEmail} className="support-copy" aria-label="Copy support email"><Copy className="size-4" /></button>
                  <AnimatePresence>{copied && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="copied-note">Copied!</motion.span>}</AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <main className="timely-landing">
      <CustomCursor />
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
            description:
              "Fair, conflict-free teacher substitution planning for schools.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />
      <header className="landing-navbar sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-foreground" aria-label="Timely home">
            <Logo size="md" />
            <span className="text-lg font-bold">Timely</span>
          </Link>
          <nav className="flex items-center gap-2" aria-label="Main navigation">
            <Button asChild variant="ghost" size="sm" className="px-2 text-xs sm:px-3 sm:text-sm">
              <Link to="/student">Student portal</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth" search={{ tab: "login" }}>Log in</Link>
            </Button>
            <Button asChild size="sm" className="landing-nav-btn-primary">
              <Link to="/auth" search={{ tab: "signup" }}>Sign up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="hero-section px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ duration: 0.5 }}>
              <span className="landing-eyebrow"><Users className="size-4" /> Built for busy school mornings</span>
            </motion.div>
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={reveal}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
            >
              Never scramble for a substitute teacher again
            </motion.h1>
            <motion.p
              initial="hidden"
              animate="visible"
              variants={reveal}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-xl"
            >
              Generate fair, conflict-free substitution plans in 90 seconds — ready to print, no setup needed.
            </motion.p>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={reveal}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:justify-center"
            >
              <Button asChild size="lg" className="landing-cta-btn cta-pulse w-full sm:w-auto">
                <Link to="/app">Launch Dashboard <ArrowRight /></Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="landing-light-cta w-full sm:w-auto">
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <motion.section
        id="why-it-matters"
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={reveal}
        className="landing-section landing-section-soft"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="section-heading">
            <span>Why this matters</span>
            <h2>A calmer start for the whole school</h2>
            <p>When someone is absent, the admin team carries the pressure. Timely helps you act quickly without losing fairness.</p>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {problems.map((problem, index) => (
              <motion.article key={problem.title} variants={reveal} transition={{ delay: index * 0.08 }} className="problem-item">
                <span className="problem-icon"><problem.icon className="size-5" /></span>
                <h3>{problem.title}</h3>
                <p>{problem.copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.section>

      <section className="landing-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={reveal} className="section-heading">
            <span>Fast, fair, simple</span>
            <h2>Less admin. More confidence.</h2>
          </motion.div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <motion.article
                key={benefit.label}
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
                variants={reveal}
                transition={{ delay: index * 0.08 }}
                className="landing-glass-card"
              >
                <span className="benefit-icon"><benefit.icon className="size-5" /></span>
                <p className="benefit-label">{benefit.label}</p>
                <h3>{benefit.stat}</h3>
                <p>{benefit.copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="landing-section landing-section-soft scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={reveal} className="section-heading">
            <span>How it works</span>
            <h2>From absences to a fair plan in three steps</h2>
          </motion.div>
          <ol className="steps-list mt-12">
            {steps.map((step, index) => (
              <motion.li
                key={step.number}
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
                variants={reveal}
                transition={{ delay: index * 0.1 }}
                className="step-item"
              >
                <span className="step-number">{step.number}</span>
                <div><h3>{step.title}</h3><p>{step.copy}</p></div>
                {index < steps.length - 1 && <ArrowRight className="step-arrow" aria-hidden="true" />}
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <motion.section initial="hidden" whileInView="visible" viewport={viewport} variants={reveal} className="landing-section">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <figure className="testimonial-card">
            <div className="quote-mark" aria-hidden="true">“</div>
            <blockquote>Saves us 30 minutes. Fairness logic means no teacher gets burned out.</blockquote>
          </figure>
          <SupportOptions />
        </div>
      </motion.section>

      <section className="landing-section landing-section-soft">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={reveal} className="section-heading">
            <span>FAQ</span>
            <h2>Questions school admins ask</h2>
          </motion.div>
          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
              <motion.article
                key={faq.question}
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
                variants={reveal}
                transition={{ delay: index * 0.06 }}
                className="glass faq-item"
              >
                <button type="button" className="faq-question" onClick={() => setOpenFaq(isOpen ? null : index)} aria-expanded={isOpen}><span>{faq.question}</span><ChevronDown className="size-5" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} /></button>
                <AnimatePresence initial={false}>{isOpen && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="faq-answer"><p>{faq.answer}</p></motion.div>}</AnimatePresence>
              </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-foreground"><Logo size="sm" /><span className="font-bold">Timely</span></Link>
          <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:gap-6">
            <Link to="/student">Student portal</Link>
            <Link to="/auth" search={{ tab: "login" }}>Log in</Link>
            <Link to="/auth" search={{ tab: "signup" }}>Sign up</Link>
            <a href="mailto:developerstimely@gmail.com">developerstimely@gmail.com</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
