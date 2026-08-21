import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  Download,
  LayoutDashboard,
  Printer,
  Save,
  Sparkles,
  Trash2,
  Users,
  AlertTriangle,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeacherRoster } from "@/components/TeacherRoster";
import { AbsenteeTracker } from "@/components/AbsenteeTracker";
import {
  DEMO_TEACHERS,
  generateSchedule,
  toCsv,
  type Absence,
  type Teacher,
} from "@/lib/substitution";
import { deleteSaved, loadSaved, saveSchedule, type SavedSchedule } from "@/lib/history";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Neev Substitution App — Automated Teacher Cover Scheduling" },
      {
        name: "description",
        content:
          "Manage the teacher roster, log daily absences and auto-generate a fair substitution schedule you can print or export as CSV.",
      },
      { property: "og:title", content: "Neev Substitution App" },
      {
        property: "og:description",
        content:
          "Automated substitution scheduling for schools: roster, absentee tracking and instant cover plans.",
      },
    ],
  }),
  component: Index,
});

type Tab = "dashboard" | "roster" | "absentees" | "history";

const NAV: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "roster", label: "Teacher Roster", icon: Users },
  { id: "absentees", label: "Absentees", icon: CalendarCheck },
  { id: "history", label: "Saved Days", icon: History },
];


function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function Index() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [teachers, setTeachers] = useState<Teacher[]>(DEMO_TEACHERS);
  const [absences, setAbsences] = useState<Absence[]>([
    { teacherId: "t1", periods: [1, 2, 4] },
    { teacherId: "t5", periods: [3, 6] },
  ]);
  const [date, setDate] = useState(todayIso());
  const [schedule, setSchedule] = useState(() =>
    generateSchedule(DEMO_TEACHERS, [
      { teacherId: "t1", periods: [1, 2, 4] },
      { teacherId: "t5", periods: [3, 6] },
    ]),
  );

  const activeAbsences = useMemo(
    () => absences.filter((a) => a.periods.length > 0),
    [absences],
  );

  const generate = () => setSchedule(generateSchedule(teachers, activeAbsences));

  const unassigned = schedule.filter((r) => !r.substituteId).length;

  const downloadCsv = () => {
    const blob = new Blob([toCsv(schedule, date)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `substitutions-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen">
      <aside className="no-print sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-sidebar px-4 py-6 text-sidebar-foreground md:flex">
        <div className="px-2">
          <p className="text-lg font-semibold tracking-tight text-sidebar-accent-foreground">
            Neev
          </p>
          <p className="text-xs text-sidebar-foreground/70">Substitution App</p>
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                tab === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-lg border border-sidebar-border px-3 py-3 text-xs text-sidebar-foreground/70">
          Cover matched by department first, then by lightest substitution load.
        </div>
      </aside>

      <main className="flex-1 px-5 py-6 md:px-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {tab === "roster"
                ? "Teacher Roster"
                : tab === "absentees"
                  ? "Daily Absentees"
                  : "Substitution Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <nav className="no-print flex gap-1 md:hidden">
            {NAV.map((item) => (
              <Button
                key={item.id}
                size="sm"
                variant={tab === item.id ? "default" : "outline"}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </nav>
        </header>

        {tab === "roster" && <TeacherRoster teachers={teachers} onChange={setTeachers} />}

        {tab === "absentees" && (
          <AbsenteeTracker
            teachers={teachers}
            absences={absences}
            date={date}
            onDateChange={setDate}
            onChange={setAbsences}
          />
        )}

        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Teachers on roster" value={teachers.length} />
              <Stat label="Absent today" value={activeAbsences.length} />
              <Stat
                label="Periods needing cover"
                value={activeAbsences.reduce((n, a) => n + a.periods.length, 0)}
              />
              <Stat label="Unassigned" value={unassigned} tone={unassigned ? "warn" : "ok"} />
            </div>

            <section className="panel print-area overflow-hidden">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold">Daily Substitution Schedule</h2>
                  <p className="text-sm text-muted-foreground">
                    {schedule.length} assignments for {date}
                  </p>
                </div>
                <div className="no-print flex flex-wrap gap-2">
                  <Button onClick={generate}>
                    <Sparkles /> Generate
                  </Button>
                  <Button variant="outline" onClick={() => window.print()}>
                    <Printer /> Print / PDF
                  </Button>
                  <Button variant="outline" onClick={downloadCsv}>
                    <Download /> CSV
                  </Button>
                </div>
              </header>

              {schedule.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No absences selected yet. Add absentees, then press Generate.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-5 py-3 font-medium">Period</th>
                        <th className="px-3 py-3 font-medium">Absent teacher</th>
                        <th className="px-3 py-3 font-medium">Subject</th>
                        <th className="px-3 py-3 font-medium">Substitute</th>
                        <th className="px-5 py-3 font-medium">Basis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((r, i) => (
                        <tr key={`${r.period}-${r.absentTeacherId}-${i}`} className="border-t border-border">
                          <td className="px-5 py-3 font-medium">P{r.period}</td>
                          <td className="px-3 py-3">{r.absentTeacherName}</td>
                          <td className="px-3 py-3 text-muted-foreground">{r.subject}</td>
                          <td
                            className={cn(
                              "px-3 py-3 font-medium",
                              !r.substituteId && "text-destructive",
                            )}
                          >
                            {r.substituteName}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">{r.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {unassigned > 0 && (
              <p className="no-print flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="size-4 text-warning" />
                {unassigned} period(s) have no free teacher — free up a slot in the roster.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "ok" | "warn";
}) {
  return (
    <div className="panel px-5 py-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold",
          tone === "warn" && "text-destructive",
          tone === "ok" && "text-success",
        )}
      >
        {value}
      </p>
    </div>
  );
}
