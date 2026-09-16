import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Search } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchStudentSubstitutions, verifyStudentAccess, type SubstitutionRecord } from "@/lib/cloud";

const STUDENT_ACCESS_KEY = "timely.studentAccess";
type StudentScheduleRow = {
  period: number;
  classSection: string;
  absentTeacherName: string;
  substituteId: string | null;
  substituteName: string;
  status: "assigned" | "overridden";
};

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "Student Noticeboard — Timely" },
      {
        name: "description",
        content: "Read-only daily substitution schedule for students.",
      },
    ],
  }),
  component: StudentNoticeboard,
});

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function StudentNoticeboard() {
  const [verifiedSchoolId, setVerifiedSchoolId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(STUDENT_ACCESS_KEY);
  });

  if (!verifiedSchoolId) {
    return <StudentAccessGate onVerified={setVerifiedSchoolId} />;
  }

  return <StudentSchedule schoolId={verifiedSchoolId} />;
}

function StudentAccessGate({ onVerified }: { onVerified: (schoolId: string) => void }) {
  const [schoolId, setSchoolId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const normalizedSchoolId = schoolId.trim().toUpperCase();
      const valid = await verifyStudentAccess(normalizedSchoolId, passcode);
      if (!valid) {
        setError("That School ID and Student Passcode do not match.");
        return;
      }
      window.localStorage.setItem(STUDENT_ACCESS_KEY, normalizedSchoolId);
      onVerified(normalizedSchoolId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify access. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="panel w-full max-w-md px-5 py-6">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Logo size="md" />
          <span className="text-lg font-semibold tracking-tight">Timely</span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Student Schedule Access</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the School ID and Student Passcode provided by your school.
        </p>
        <form className="mt-5 space-y-4" onSubmit={(event) => void submit(event)}>
          <div className="space-y-1.5">
            <Label htmlFor="student-school-id">School ID</Label>
            <Input
              id="student-school-id"
              value={schoolId}
              onChange={(event) => setSchoolId(event.target.value.toUpperCase())}
              autoComplete="organization"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="student-passcode">Student Passcode</Label>
            <Input
              id="student-passcode"
              type="password"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Verifying..." : "View student schedule"}
          </Button>
        </form>
      </section>
    </main>
  );
}

function StudentSchedule({ schoolId }: { schoolId: string }) {
  const [date, setDate] = useState(todayIso);
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const { data: substitutions = [], isError, isLoading } = useQuery<SubstitutionRecord[]>({
    queryKey: ["substitutions", schoolId, date],
    queryFn: () => fetchStudentSubstitutions(schoolId, date),
    enabled: Boolean(schoolId && date),
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  console.log("[Student View] Fetched Substitutions:", substitutions);

  if (isError) {
    console.error("[Student View] Failed to fetch substitutions.");
  }

  const schedule = useMemo(
    () =>
      substitutions
        .map((substitution) => ({
          period: substitution.period,
          classSection: substitution.className,
          absentTeacherName: substitution.originalTeacherName,
          substituteId: substitution.substituteTeacherId,
          substituteName: substitution.substituteTeacherName,
          status: substitution.status,
        }))
        .sort((a, b) => a.period - b.period),
    [substitutions],
  );
  const filteredSchedule = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return schedule.filter((row) =>
      (classFilter === "all" || row.classSection === classFilter) &&
      [row.absentTeacherName, row.substituteName, row.classSection, `p${row.period}`]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [classFilter, query, schedule]);
  const classes = useMemo(
    () => [...new Set(schedule.map((row) => row.classSection).filter(Boolean))].sort(),
    [schedule],
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-100 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Logo size="md" />
            <div>
              <p className="text-lg font-semibold tracking-tight">Timely — Student Noticeboard</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-white/50 bg-white/70 px-2.5 py-1 font-medium text-blue-900 backdrop-blur-md">
                  Read-Only View
                </span>
                <span className="text-slate-600">School ID: {schoolId}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
            <button
              type="button"
              onClick={() => {
                window.localStorage.removeItem(STUDENT_ACCESS_KEY);
                window.location.reload();
              }}
              className="text-blue-800 underline-offset-4 hover:underline"
            >
              Change school
            </button>
            <Link to="/" className="text-blue-800 underline-offset-4 hover:underline">
              Back to Timely
            </Link>
          </div>
        </header>

        <section className="glass-regular mb-6 rounded-2xl border border-white/50 bg-white/5 p-4 shadow-sm backdrop-blur-[10px] backdrop-saturate-[180%] sm:p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-800">
              Date
              <span className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-700" />
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="h-10 w-full rounded-xl border border-white/50 bg-white/70 pl-10 pr-3 text-sm text-slate-900 outline-none ring-blue-300 transition focus:ring-2"
                />
              </span>
            </label>
            <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-800">
              Class / Section
              <select
                value={classFilter}
                onChange={(event) => setClassFilter(event.target.value)}
                className="h-10 w-full rounded-xl border border-white/50 bg-white/70 px-3 text-sm text-slate-900 outline-none ring-blue-300 transition focus:ring-2"
              >
                <option value="all">All Classes (Whole School)</option>
                {classes.map((classSection) => (
                  <option key={classSection} value={classSection}>
                    {classSection}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-800">
              Search schedule
              <span className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-700" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search class, subject, or teacher"
                  className="h-10 w-full rounded-xl border border-white/50 bg-white/70 pl-10 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 ring-blue-300 transition focus:ring-2"
                />
              </span>
            </label>
          </div>
        </section>

        <section aria-live="polite" className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Today&apos;s substitutions</h1>
            <p className="text-sm text-slate-600">
              {filteredSchedule.length} of {schedule.length} periods
            </p>
          </div>

          {isLoading || schedule.length === 0 ? (
            <div className="glass-regular rounded-2xl border border-white/50 bg-white/5 px-5 py-10 text-center text-sm text-slate-600 shadow-sm backdrop-blur-[10px] backdrop-saturate-[180%]">
              No substitution
            </div>
          ) : (
            filteredSchedule.map((row) => <ScheduleCard key={`${row.period}-${row.classSection}`} row={row} />)
          )}
        </section>
      </div>
    </main>
  );
}

function ScheduleCard({ row }: { row: StudentScheduleRow }) {
  const hasSubstitute = Boolean(row.substituteId);

  return (
    <article className="glass-regular rounded-2xl border border-white/50 bg-white/5 p-4 shadow-sm backdrop-blur-[10px] backdrop-saturate-[180%] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="shrink-0 rounded-xl bg-blue-100 px-3 py-2 text-sm font-bold text-blue-900">
            P{row.period}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-slate-900">
              P{row.period} · {row.classSection}
            </p>
            <p className="mt-1 text-sm text-slate-600">Regular teacher: {row.absentTeacherName}</p>
          </div>
        </div>
        <div className="min-w-0 sm:text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {hasSubstitute ? `Substituted: ${row.substituteName}` : "Substitute teacher"}
          </p>
          <span
            className={`mt-1 inline-flex max-w-full rounded-full px-3 py-1.5 text-sm font-semibold ${
              hasSubstitute
                ? "border border-emerald-200 bg-emerald-100/80 text-emerald-900"
                : "border border-slate-200 bg-slate-100/80 text-slate-600"
            }`}
          >
            <span className="truncate">{hasSubstitute ? row.substituteName : "No substitute assigned"}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
