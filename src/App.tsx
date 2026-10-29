import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  Inbox,
  LockKeyhole,
  Printer,
  ShieldCheck,
  Shuffle,
  Sparkles,
  WifiOff,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { isPathAllowedForRole, type AppRole } from "./lib/access";

type FeatureCard = {
  title: string;
  copy: string;
  icon: "calendar" | "shuffle" | "inbox" | "graduate" | "printer" | "offline";
};

const publicStats = [
  { label: "0 clashes", value: "0", detail: "validated timetable conflicts" },
  { label: "Under 5s", value: "< 5s", detail: "substitute planning in a live school day" },
  { label: "100% covered", value: "100%", detail: "assignment tracking for all periods" },
];

const featureCards: FeatureCard[] = [
  { title: "Auto-generated timetable", copy: "Build a clash-free master schedule in moments using teacher, class and subject constraints.", icon: "calendar" },
  { title: "Smart substitutions", copy: "Resolve absences with a fair, class-aware fill order before the bell rings.", icon: "shuffle" },
  { title: "Teacher requests", copy: "Log leave requests, extra-period approvals and admin actions in a single flow.", icon: "inbox" },
  { title: "Student visibility", copy: "Students see the class routine, today and next, and live changes without confusion.", icon: "graduate" },
  { title: "Print & share", copy: "Share a clean schedule or export the day in a format ready for front office use.", icon: "printer" },
  { title: "Offline ready", copy: "The latest school plan stays available even when the internet is briefly unstable.", icon: "offline" },
];

const credentials: Record<AppRole, { email: string; password: string }> = {
  admin: { email: "admin@edusync.school", password: "admin123" },
  teacher: { email: "teacher@edusync.school", password: "teacher123" },
  student: { email: "student@edusync.school", password: "student123" },
};

const adminCoverage = [
  { teacher: "Mr. Aarav Mehta", dept: "Science", periods: "P3, P5", cover: "Ms. Diya Kapoor", status: "Covered" },
  { teacher: "Ms. Riya Sen", dept: "English", periods: "P6", cover: "Ms. Meera Nair", status: "Pending" },
  { teacher: "Mr. Rohan Iyer", dept: "Maths", periods: "P2", cover: "Mr. Vikram Singh", status: "Covered" },
];

const classSchedule = [
  { period: "P1", time: "08:20-09:00", subject: "English", teacher: "Asha Verma", room: "Room 6A" },
  { period: "P2", time: "09:00-09:40", subject: "Maths", teacher: "Ravi Kumar", room: "Room 6A" },
  { period: "P3", time: "09:40-10:20", subject: "Science", teacher: "Nisha Shah", room: "Physics Lab" },
  { period: "P4", time: "10:20-11:00", subject: "Social", teacher: "Rohan Das", room: "Room 7B" },
  { period: "P5", time: "11:20-12:00", subject: "Science", teacher: "Cover: Ms. Kapoor", room: "Physics Lab", highlight: true },
  { period: "P6", time: "12:00-12:40", subject: "Computer", teacher: "Mohan Roy", room: "IT Lab" },
];

const typedHeadlinePhrases = [
  "Smart Timetables",
  "Fair Substitutions",
  "Live Coverage",
];

function TypewriterHeadline() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = typedHeadlinePhrases[phraseIndex];

    if (!isDeleting && text === currentPhrase) {
      const holdTimeout = window.setTimeout(() => setIsDeleting(true), 1400);
      return () => window.clearTimeout(holdTimeout);
    }

    if (isDeleting && text === "") {
      const switchTimeout = window.setTimeout(() => {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % typedHeadlinePhrases.length);
      }, 180);
      return () => window.clearTimeout(switchTimeout);
    }

    const tickTimeout = window.setTimeout(() => {
      if (isDeleting) {
        setText(currentPhrase.slice(0, Math.max(0, text.length - 1)));
      } else {
        setText(currentPhrase.slice(0, text.length + 1));
      }
    }, isDeleting ? 55 : 90);

    return () => window.clearTimeout(tickTimeout);
  }, [text, isDeleting, phraseIndex]);

  return <span className="typewriter-text">{text}</span>;
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F2F6F9] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#442DC5] to-[#7C3AED] text-sm font-bold text-white shadow-lg shadow-indigo-300/40">E</div>
            <div className="text-sm font-semibold tracking-[0.24em] text-slate-900">EDUSYNC</div>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-slate-900">Features</a>
            <a href="#how-it-works" className="transition hover:text-slate-900">How it works</a>
            <a href="#portal" className="transition hover:text-slate-900">School portal</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:-translate-y-0.5">Log in</Link>
            <Link to="/schedule" className="rounded-xl bg-gradient-to-r from-[#442DC5] to-[#5B49DA] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-300/40">View timetable</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-16 md:grid-cols-2 md:pt-20">
          <div className="absolute left-[-80px] top-16 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />
          <div className="absolute bottom-8 right-0 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl" />

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-[#442DC5] shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> School operations, built for the first bell
            </div>
            <h1 className="mt-6 text-5xl font-black leading-[0.98] tracking-[-0.04em] text-[#121824] md:text-6xl">
              <TypewriterHeadline />
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Build a clash-free timetable and assign live cover before the school day begins.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#442DC5] to-[#5B49DA] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-300/40">
                Log in <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/schedule" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300">View school timetable</Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 35, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hero-panel rounded-[28px] border border-slate-200 bg-white/80 p-5 shadow-[0_22px_80px_rgba(68,45,197,0.12)] backdrop-blur-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">10-A timetable</div>
                <div className="mt-2 text-xl font-bold text-slate-900">Monday</div>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Coverage ready</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs text-slate-600">
              {classSchedule.map((slot) => (
                <motion.div
                  key={slot.period}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className={`rounded-xl border p-2 ${slot.highlight ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50"}`}
                >
                  <div className="font-bold">{slot.period}</div>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.12em] text-slate-500">{slot.time}</div>
                  <div className="mt-2 font-semibold">{slot.subject}</div>
                  <div className="mt-1 text-[10px]">{slot.teacher}</div>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              Coverage assigned: Ms. Diya Kapoor for Science
            </div>
          </motion.div>
        </section>

        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.6 }} className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-6 md:grid-cols-3">
            {publicStats.map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <div className="text-3xl font-black text-[#121824]">{stat.value}</div>
                <div className="mt-2 text-sm text-slate-600">{stat.detail}</div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section id="features" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }} className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 text-center">
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-[#442DC5]">Features</div>
            <h2 className="mt-3 text-3xl font-bold text-[#121824]">From timetable generation to live coverage</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {featureCards.map((feature, index) => {
              const iconMap = {
                calendar: CalendarClock,
                shuffle: Shuffle,
                inbox: Inbox,
                graduate: GraduationCap,
                printer: Printer,
                offline: WifiOff,
              } as const;
              const Icon = iconMap[feature.icon];

              return (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="reveal-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-[#EEF0FF] p-2 text-[#442DC5]"><Icon className="h-5 w-5" /></div>
                  <h3 className="text-lg font-semibold text-[#121824]">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{feature.copy}</p>
                </motion.article>
              );
            })}
          </div>
        </motion.section>

        <motion.section id="how-it-works" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }} className="bg-[#0F1628] py-20 text-white">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-10 text-center">
              <div className="text-[11px] font-black uppercase tracking-[0.24em] text-indigo-300">How it works</div>
              <h2 className="mt-3 text-3xl font-bold">The routine becomes simple and transparent</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { step: "01", title: "Admin marks absence", text: "Log a teacher absence and capture all affected periods in one action." },
                { step: "02", title: "EduSync finds a cover", text: "The engine checks subject match, class fit and daily load before assigning cover." },
                { step: "03", title: "Teachers and students see it live", text: "Updated plans appear the moment the substitution is confirmed." },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5 shadow-lg shadow-slate-950/10"
                >
                  <div className="mb-3 text-sm font-semibold text-indigo-300">Step {item.step}</div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm text-slate-300">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section id="portal" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }} className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 text-center">
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-[#442DC5]">Roles</div>
            <h2 className="mt-3 text-3xl font-bold text-[#121824]">Built for every stakeholder</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Admin", text: "Generate timetables, manage absences, review requests and monitor live coverage." },
              { icon: CheckCircle2, title: "Teacher", text: "See your timetable, acknowledge assigned coverage and request support as needed." },
              { icon: GraduationCap, title: "Student", text: "View the class schedule, live substitution alerts and announcements." },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-3 inline-flex rounded-xl bg-[#EEF0FF] p-3 text-[#442DC5]"><Icon className="h-6 w-6" /></div>
                  <h3 className="text-xl font-semibold text-[#121824]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </main>
    </div>
  );
}

function SchedulePage() {
  return (
    <div className="min-h-screen bg-[#F2F6F9] p-6">
      <div className="mx-auto max-w-5xl rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Schedule portal</div>
            <h1 className="mt-2 text-3xl font-bold text-[#121824]">Weekly timetable</h1>
          </div>
          <Link to="/" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">Back to home</Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[
            { day: "Monday", subject: "English", teacher: "Asha Verma", room: "Room 6A" },
            { day: "Tuesday", subject: "Science", teacher: "Nisha Shah", room: "Physics Lab" },
            { day: "Wednesday", subject: "Maths", teacher: "Ravi Kumar", room: "Room 7B" },
            { day: "Thursday", subject: "Computer", teacher: "Mohan Roy", room: "IT Lab" },
            { day: "Friday", subject: "Physics", teacher: "Amit Das", room: "Physics Lab" },
            { day: "Saturday", subject: "Art", teacher: "Kavya Das", room: "Arts Room" },
          ].map((slot) => (
            <div key={slot.day} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{slot.day}</div>
              <div className="mt-2 text-lg font-bold text-[#121824]">{slot.subject}</div>
              <div className="mt-2 text-sm text-slate-600">{slot.teacher}</div>
              <div className="mt-1 text-xs text-slate-500">{slot.room}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<AppRole>("admin");
  const [email, setEmail] = useState(credentials.admin.email);
  const [password, setPassword] = useState(credentials.admin.password);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleLabel = role === "student" ? "Admission number" : "Email";

  const handleRoleChange = (nextRole: AppRole) => {
    setRole(nextRole);
    setError(null);
    setEmail(credentials[nextRole].email);
    setPassword(credentials[nextRole].password);
  };

  const handleSubmit = () => {
    const expected = credentials[role];
    if (!email.trim()) {
      setError("Please enter your email or admission number.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }
    if (email !== expected.email || password !== expected.password) {
      setError("Incorrect credentials for this role. Check the selected tab and try again.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setTimeout(() => {
      const destination = role === "admin" ? "/admin/dashboard" : role === "teacher" ? "/teacher/dashboard" : "/student";
      navigate(destination, { replace: true });
      setIsSubmitting(false);
    }, 250);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#F2F6F9] p-6">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-[#442DC5]">EduSync</div>
            <h1 className="mt-2 text-2xl font-bold text-[#121824]">Welcome back</h1>
          </div>
          <div className="rounded-full bg-[#EEF0FF] p-2 text-[#442DC5]"><LockKeyhole className="h-4 w-4" /></div>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1">
          {(["admin", "teacher", "student"] as AppRole[]).map((tab) => (
            <button key={tab} onClick={() => handleRoleChange(tab)} className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${role === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            {roleLabel}
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-[#442DC5] focus:ring-4 focus:ring-indigo-200" placeholder={role === "student" ? "Admission number" : "Email"} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-[#442DC5] focus:ring-4 focus:ring-indigo-200" placeholder="Password" />
          </label>

          {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}

          <div className="flex items-center justify-between text-sm text-slate-600">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 accent-[#442DC5]" defaultChecked />
              Remember me
            </label>
            <span className="font-medium text-slate-600">Reset access through the school admin</span>
          </div>

          <button disabled={isSubmitting} onClick={handleSubmit} className="w-full rounded-xl bg-[#442DC5] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-[#3925b4] disabled:cursor-not-allowed disabled:opacity-75">
            {isSubmitting ? "Signing in..." : `Sign in as ${role}`}
          </button>

          <Link to="/" className="block text-center text-sm font-medium text-slate-600 underline-offset-4 hover:underline">Back to home</Link>
        </div>
      </div>
    </div>
  );
}

function RoleDashboard({ role, title, subtitle, children }: { role: AppRole; title: string; subtitle: string; children: React.ReactNode }) {
  const navItems = {
    admin: [
      { label: "Dashboard", to: "/admin/dashboard" },
      { label: "Timetable", to: "/admin/timetable" },
      { label: "Substitutions", to: "/admin/substitutions" },
      { label: "Requests", to: "/admin/requests" },
    ],
    teacher: [
      { label: "Dashboard", to: "/teacher/dashboard" },
      { label: "Routine", to: "/teacher/routine" },
      { label: "Requests", to: "/teacher/requests" },
    ],
    student: [
      { label: "Today", to: "/student" },
      { label: "Weekly view", to: "/student/weekly" },
      { label: "Complaints", to: "/student/complaints" },
    ],
  }[role];

  return (
    <div className="min-h-screen bg-[#F2F6F9] p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">EduSync {role}</div>
            <h1 className="mt-2 text-2xl font-bold text-[#121824]">{title}</h1>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Live and synced
          </div>
        </div>

        <div className="mb-6 grid gap-6 xl:grid-cols-[220px_1fr]">
          <aside className="rounded-[24px] border border-slate-200 bg-slate-950 p-4 text-slate-200">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#442DC5] text-sm font-bold text-white">E</div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">School</div>
                <div className="font-medium text-white">{role === "admin" ? "Admin" : role === "teacher" ? "Teacher" : "Student"} portal</div>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          <div>
            <div className="mb-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-600">{subtitle}</div>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboardPage() {
  return (
    <RoleDashboard role="admin" title="School operations dashboard" subtitle="Review coverage, notices and the most important action items for the day.">
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#121824]">Live coverage table</h2>
            <button className="rounded-xl bg-[#442DC5] px-3 py-2 text-xs font-semibold text-white">Run substitution solver</button>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Teacher</th>
                  <th className="px-3 py-2.5 font-semibold">Department</th>
                  <th className="px-3 py-2.5 font-semibold">Periods</th>
                  <th className="px-3 py-2.5 font-semibold">Coverage</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {adminCoverage.map((row) => (
                  <tr key={row.teacher} className="border-t border-slate-200">
                    <td className="px-3 py-3 font-medium text-slate-800">{row.teacher}</td>
                    <td className="px-3 py-3 text-slate-600">{row.dept}</td>
                    <td className="px-3 py-3 text-slate-600">{row.periods}</td>
                    <td className="px-3 py-3 text-slate-600">{row.cover}</td>
                    <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${row.status === "Covered" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{row.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-[#121824]">Noticeboard</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Pending</div>
              <div className="mt-2 text-sm font-medium text-slate-800">Ms. Riya Sen requires a final assigned cover for P6.</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Leave request</div>
              <div className="mt-2 text-sm font-medium text-slate-800">Mr. Rohan Iyer has requested leave for Friday morning.</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Review</div>
              <div className="mt-2 text-sm font-medium text-slate-800">A minor facilities complaint is already flagged for review.</div>
            </div>
          </div>
        </div>
      </div>
    </RoleDashboard>
  );
}

function AdminTimetablePage() {
  return (
    <RoleDashboard role="admin" title="Timetable workspace" subtitle="View allocation and verify coverage before publishing the day.">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Class</div>
            <h2 className="mt-2 text-2xl font-bold text-[#121824]">Class 10-A</h2>
          </div>
          <button className="rounded-xl bg-[#442DC5] px-4 py-2 text-sm font-semibold text-white">Auto-generate timetable</button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {classSchedule.map((slot) => (
            <div key={slot.period} className={`rounded-2xl border p-4 ${slot.highlight ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{slot.period}</span>
                {slot.highlight ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">Cover</span> : null}
              </div>
              <div className="mt-3 text-[11px] text-slate-500">{slot.time}</div>
              <div className="mt-2 text-lg font-bold text-[#121824]">{slot.subject}</div>
              <div className="mt-2 text-sm text-slate-600">{slot.teacher}</div>
              <div className="mt-1 text-xs text-slate-500">{slot.room}</div>
            </div>
          ))}
        </div>
      </div>
    </RoleDashboard>
  );
}

function AdminSubstitutionsPage() {
  return (
    <RoleDashboard role="admin" title="Substitution centre" subtitle="Review coverage actions and school-day resilience.">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#121824]">Coverage response</h2>
          <button className="rounded-xl bg-[#442DC5] px-4 py-2 text-sm font-semibold text-white">Run substitution solver</button>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2.5 font-semibold">Teacher</th>
                <th className="px-3 py-2.5 font-semibold">Department</th>
                <th className="px-3 py-2.5 font-semibold">Periods</th>
                <th className="px-3 py-2.5 font-semibold">Assigned cover</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {adminCoverage.map((row) => (
                <tr key={row.teacher} className="border-t border-slate-200">
                  <td className="px-3 py-3 font-medium text-slate-800">{row.teacher}</td>
                  <td className="px-3 py-3 text-slate-600">{row.dept}</td>
                  <td className="px-3 py-3 text-slate-600">{row.periods}</td>
                  <td className="px-3 py-3 text-slate-600">{row.cover}</td>
                  <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${row.status === "Covered" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RoleDashboard>
  );
}

function AdminRequestsPage() {
  return (
    <RoleDashboard role="admin" title="Request inbox" subtitle="Approve participation changes before they affect the timetable.">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <div className="font-semibold text-[#121824]">Leave request</div>
              <div className="text-sm text-slate-600">Mr. Rohan Iyer requested leave for Friday morning.</div>
            </div>
            <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">Pending</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <div className="font-semibold text-[#121824]">Extra period</div>
              <div className="text-sm text-slate-600">Chemistry extra period requested for Class 11-A.</div>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Approved</span>
          </div>
        </div>
      </div>
    </RoleDashboard>
  );
}

function TeacherDashboardPage() {
  return (
    <RoleDashboard role="teacher" title="Teacher workflow" subtitle="Review the day, your classroom plan and any approval requests.">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "P1 · English · 9-A", status: "Current" },
          { label: "P2 · Maths · 10-A", status: "Next" },
          { label: "P3 · Science · 8-B", status: "Assigned" },
          { label: "P4 · Chemistry · 11-A", status: "Covered" },
          { label: "P5 · Free period", status: "Available" },
        ].map((entry) => (
          <div key={entry.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-[#121824]">{entry.label}</div>
              <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#442DC5]">{entry.status}</span>
            </div>
          </div>
        ))}
      </div>
    </RoleDashboard>
  );
}

function TeacherRoutinePage() {
  return (
    <RoleDashboard role="teacher" title="Routine" subtitle="Your daily structure and classroom plan for the school day.">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[
            { label: "Period 1", value: "English · Class 9-A" },
            { label: "Period 2", value: "Maths · Class 10-A" },
            { label: "Period 3", value: "Science · Class 8-B" },
            { label: "Period 4", value: "English · Class 7-A" },
            { label: "Period 5", value: "Cover duty · Class 10-A" },
            { label: "Period 6", value: "Free period" },
          ].map((entry) => (
            <div key={entry.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{entry.label}</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{entry.value}</div>
            </div>
          ))}
        </div>
      </div>
    </RoleDashboard>
  );
}

function StudentDashboardPage() {
  return (
    <RoleDashboard role="student" title="Class 10-A" subtitle="Today’s plan, live updates and the next major class transition.">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-[#121824]">Now and next</div>
          <div className="mt-3 text-sm text-slate-600">Current period: Science · Ends in 12 minutes</div>
          <div className="mt-2 text-sm text-slate-600">Next: Computer · 12:00 PM</div>
        </div>
      </div>
    </RoleDashboard>
  );
}

function StudentWeeklyPage() {
  return (
    <RoleDashboard role="student" title="Weekly timetable" subtitle="Check the week ahead and any substitutions that affect your classes.">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {classSchedule.map((slot) => (
            <div key={slot.period} className={`rounded-2xl border p-4 ${slot.highlight ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{slot.period}</div>
              <div className="mt-2 text-lg font-bold text-[#121824]">{slot.subject}</div>
              <div className="mt-2 text-sm text-slate-600">{slot.teacher}</div>
              <div className="mt-1 text-xs text-slate-500">{slot.room}</div>
            </div>
          ))}
        </div>
      </div>
    </RoleDashboard>
  );
}

function ForbiddenPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#F2F6F9] p-6">
      <div className="max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-2xl text-rose-700">403</div>
        <h1 className="text-2xl font-bold text-[#121824]">Access denied</h1>
        <p className="mt-2 text-sm text-slate-600">This route is restricted for your role. Please sign in with the correct account.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/login" className="rounded-xl bg-[#442DC5] px-4 py-2 text-sm font-semibold text-white">Go to login</Link>
          <Link to="/" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">Back home</Link>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ role, children }: { role: AppRole; children: React.ReactNode }) {
  const location = useLocation();
  if (!isPathAllowedForRole(location.pathname, role)) return <Navigate to="/403" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/schedule" element={<SchedulePage />} />

        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/admin/timetable" element={<ProtectedRoute role="admin"><AdminTimetablePage /></ProtectedRoute>} />
        <Route path="/admin/substitutions" element={<ProtectedRoute role="admin"><AdminSubstitutionsPage /></ProtectedRoute>} />
        <Route path="/admin/requests" element={<ProtectedRoute role="admin"><AdminRequestsPage /></ProtectedRoute>} />

        <Route path="/teacher/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboardPage /></ProtectedRoute>} />
        <Route path="/teacher/routine" element={<ProtectedRoute role="teacher"><TeacherRoutinePage /></ProtectedRoute>} />
        <Route path="/teacher/requests" element={<ProtectedRoute role="teacher"><AdminRequestsPage /></ProtectedRoute>} />

        <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboardPage /></ProtectedRoute>} />
        <Route path="/student/weekly" element={<ProtectedRoute role="student"><StudentWeeklyPage /></ProtectedRoute>} />
        <Route path="/student/complaints" element={<ProtectedRoute role="student"><StudentDashboardPage /></ProtectedRoute>} />

        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
