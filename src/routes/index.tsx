import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Clock3,
  Coffee,
  Scale,
  Sparkles,
  Users,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Timely — Fair Teacher Substitution Plans in 90 Seconds" },
      {
        name: "description",
        content:
          "Generate fair, conflict-free teacher substitution plans in 90 seconds. Timely is simple, print-ready, and built for busy school mornings.",
      },
      { property: "og:title", content: "Timely — Substitute Plans Without the Morning Scramble" },
      {
        property: "og:description",
        content: "A fast, fair and simple way for school admins to arrange teacher substitutions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
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
    question: "Will teachers use it?",
    answer:
      "Teachers do not need to learn another system. The admin creates a clear plan that can be printed or shared in the usual way.",
  },
  {
    question: "Is it secure?",
    answer:
      "You can create a plan without an account. If you choose to sign up, your saved school information stays linked to your account.",
  },
  {
    question: "What if I make a mistake?",
    answer:
      "You can change an absence or substitute before printing. Timely lets you review the full plan first.",
  },
];

function Landing() {
  return (
    <main className="timely-landing">
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
        </div>
      </motion.section>

      <section className="landing-section landing-section-soft">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={reveal} className="section-heading">
            <span>FAQ</span>
            <h2>Questions school admins ask</h2>
          </motion.div>
          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => (
              <motion.details
                key={faq.question}
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
                variants={reveal}
                transition={{ delay: index * 0.06 }}
                className="faq-item"
              >
                <summary><span>{faq.question}</span><ChevronDown className="size-5" /></summary>
                <p>{faq.answer}</p>
              </motion.details>
            ))}
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