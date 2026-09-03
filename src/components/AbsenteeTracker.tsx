import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PERIODS, type Absence, type Teacher } from "@/lib/substitution";
import { cn } from "@/lib/utils";

type Props = {
  teachers: Teacher[];
  absences: Absence[];
  date: string;
  onDateChange: (d: string) => void;
  onChange: (a: Absence[]) => void;
};

export function AbsenteeTracker({ teachers, absences, date, onDateChange, onChange }: Props) {
  const get = (id: string) => absences.find((a) => a.teacherId === id);

  const toggleTeacher = (t: Teacher) => {
    if (get(t.id)) {
      onChange(absences.filter((a) => a.teacherId !== t.id));
    } else {
      const busyPeriods = PERIODS.filter((p) => t.busy[p]);
      onChange([...absences, { teacherId: t.id, periods: busyPeriods }]);
    }
  };

  const togglePeriod = (id: string, period: number) => {
    onChange(
      absences.map((a) =>
        a.teacherId === id
          ? {
              ...a,
              periods: a.periods.includes(period)
                ? a.periods.filter((p) => p !== period)
                : [...a.periods, period].sort((x, y) => x - y),
            }
          : a,
      ),
    );
  };

  return (
    <section className="panel overflow-hidden">
      <header className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:px-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">Daily Absentee Tracker</h2>
          <p className="text-sm text-muted-foreground">
            Tick absent teachers, then choose the periods they will miss.
          </p>
        </div>
        <div className="flex items-end gap-2">
          <label className="text-xs font-medium text-muted-foreground">
            Date
            <Input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="mt-1 h-9 w-[9.5rem]"
            />
          </label>
          <Button variant="outline" size="sm" onClick={() => onChange([])}>
            Clear all
          </Button>
        </div>
      </header>

      <ul className="divide-y divide-border">
        {teachers.map((t) => {
          const absence = get(t.id);
          return (
            <li
              key={t.id}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2 sm:px-5"
            >
              <label className="flex min-w-0 items-center gap-3 sm:min-w-56">
                <Checkbox checked={!!absence} onCheckedChange={() => toggleTeacher(t)} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{t.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{t.subject}</span>
                </span>
              </label>
              <div className="grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap">

                {PERIODS.map((p) => {
                  const selected = absence?.periods.includes(p);
                  const teaches = !!t.busy[p];
                  return (
                    <button
                      key={p}
                      type="button"
                      disabled={!absence}
                      onClick={() => togglePeriod(t.id, p)}
                      title={teaches ? `Period ${p} — has a class` : `Period ${p} — free`}
                      className={cn(
                        "h-8 w-full rounded-md sm:w-10 border-2 text-xs font-semibold transition-colors",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : teaches
                            ? "border-secondary bg-secondary text-foreground"
                            : "border-primary bg-primary text-foreground",
                        !absence && "opacity-40",
                        absence && !selected && "hover:border-primary/40",
                      )}
                    >
                      P{p}
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
