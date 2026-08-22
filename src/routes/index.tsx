import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  Download,
  LayoutDashboard,
  Menu,
  Printer,
  Save,
  Sparkles,
  Trash2,
  Users,
  AlertTriangle,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  const [navOpen, setNavOpen] = useState(false);

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

  const [saved, setSaved] = useState<SavedSchedule[]>([]);
  useEffect(() => setSaved(loadSaved()), []);

  const generate = () => setSchedule(generateSchedule(teachers, activeAbsences));

  const unassigned = schedule.filter((r) => !r.substituteId).length;

  const save = () => {
    if (schedule.length === 0) return;
    setSaved(saveSchedule(date, schedule));
  };

  const restore = (entry: SavedSchedule) => {
    setDate(entry.date);
    setSchedule(entry.rows);
    setTab("dashboard");
  };

  const downloadCsv = (rows = schedule, label = date) => {
    const blob = new Blob([toCsv(rows, label)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `substitutions-${label}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div className="flex min-h-screen flex-col md:flex-row">
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

      {/* Mobile top navbar */}
      <div className="no-print sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 bg-sidebar px-4 py-3 text-sidebar-foreground md:hidden">
        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Open navigation"
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-sidebar text-sidebar-foreground">
            <SheetHeader>
              <SheetTitle className="text-sidebar-accent-foreground">Neev</SheetTitle>
            </SheetHeader>
            <nav className="mt-2 flex flex-col gap-1 px-2">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setTab(item.id);
                    setNavOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
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
          </SheetContent>
        </Sheet>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">
            {NAV.find((n) => n.id === tab)?.label}
          </p>
          <p className="truncate text-xs text-sidebar-foreground/70">Neev Substitution App</p>
        </div>
      </div>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-5 md:px-8">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {tab === "roster"
                ? "Teacher Roster"
                : tab === "absentees"
                  ? "Daily Absentees"
                  : tab === "history"
                    ? "Saved Schedules"
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
              <header className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold">Daily Substitution Schedule</h2>
                  <p className="text-sm text-muted-foreground">
                    {schedule.length} assignments for {date}
                  </p>
                </div>
                <div className="no-print grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <Button onClick={generate} className="w-full sm:w-auto">
                    <Sparkles /> Generate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={save}
                    disabled={schedule.length === 0}
                    className="w-full sm:w-auto"
                  >
                    <Save /> Save day
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.print()}
                    className="w-full sm:w-auto"
                  >
                    <Printer /> Print / PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => downloadCsv()}
                    className="w-full sm:w-auto"
                  >
                    <Download /> CSV
                  </Button>
                </div>


              </header>

              {schedule.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No absences selected yet. Add absentees, then press Generate.
                </p>
              ) : (
                <>
                  {/* Mobile: stacked cards */}
                  <ul className="divide-y divide-border lg:hidden">
                    {schedule.map((r, i) => (
                      <li
                        key={`m-${r.period}-${r.absentTeacherId}-${i}`}
                        className="space-y-2 px-4 py-4 text-sm"
                      >
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{r.absentTeacherName}</p>
                            <p className="truncate text-xs text-muted-foreground">{r.subject}</p>
                          </div>
                          <span className="shrink-0 rounded-md bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">
                            P{r.period}
                          </span>
                        </div>
                        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1 text-xs">
                          <span className="text-muted-foreground">Substitute</span>
                          <span
                            className={cn(
                              "min-w-0 break-words font-medium",
                              !r.substituteId && "text-destructive",
                            )}
                          >
                            {r.substituteName}
                          </span>
                          <span className="text-muted-foreground">Basis</span>
                          <span className="min-w-0 break-words text-muted-foreground">
                            {r.reason}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Desktop: table */}
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full text-sm">
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
                          <tr
                            key={`${r.period}-${r.absentTeacherId}-${i}`}
                            className="border-t border-border"
                          >
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
                </>
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

        {tab === "history" && (
          <section className="panel overflow-hidden">
            <header className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">Saved Schedules</h2>
              <p className="text-sm text-muted-foreground">
                Previously saved days, kept on this device. Open one to view or export it.
              </p>
            </header>
            {saved.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                Nothing saved yet — generate a schedule and press “Save day”.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {saved.map((s) => (
                  <li
                    key={s.date}
                    className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {new Date(`${s.date}T00:00:00`).toLocaleDateString(undefined, {
                          weekday: "short",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.rows.length} assignments · saved{" "}
                        {new Date(s.savedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restore(s)}
                        className="flex-1 sm:flex-none"
                      >
                        Open
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadCsv(s.rows, s.date)}
                      >
                        <Download /> CSV
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSaved(deleteSaved(s.date))}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
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
