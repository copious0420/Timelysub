import { CalendarDays, ChevronDown, UserRound } from "lucide-react";
import { useMemo } from "react";
import {
  SCHOOL_DAYS,
  SCHOOL_PERIODS,
  type ClassSection,
  type MasterTimetable,
  type SchoolDay,
  type SchoolPeriod,
  type SchoolTeacher,
  type Subject,
} from "../../types/school-domain";
import { cn } from "../../lib/utils";

const dayNames: Record<SchoolDay, string> = { 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" };

interface MasterTimetableGridProps {
  classSections: ClassSection[];
  teachers: SchoolTeacher[];
  subjects: Subject[];
  timetable: MasterTimetable[];
  selectedClassSectionId?: string;
  onClassSectionChange?: (classSectionId: string) => void;
  onCellSelect?: (cell: MasterTimetable | undefined, day: SchoolDay, period: SchoolPeriod) => void;
  compact?: boolean;
}

export function MasterTimetableGrid({
  classSections,
  teachers,
  subjects,
  timetable,
  selectedClassSectionId,
  onClassSectionChange,
  onCellSelect,
  compact = false,
}: MasterTimetableGridProps): JSX.Element {
  const selectedClass = selectedClassSectionId ?? classSections[0]?.id;
  const timetableByKey = useMemo(() => new Map(timetable.map((cell) => [`${cell.classSectionId}:${cell.dayOfWeek}:${cell.period}`, cell])), [timetable]);
  const teacherById = useMemo(() => new Map(teachers.map((teacher) => [teacher.id, teacher])), [teachers]);
  const subjectById = useMemo(() => new Map(subjects.map((subject) => [subject.id, subject])), [subjects]);

  return (
    <section className="panel overflow-hidden" aria-label="Master weekly timetable">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700"><CalendarDays size={18} /></div>
          <div><h2 className="font-['Outfit'] text-lg font-bold text-slate-900">Master weekly timetable</h2><p className="text-xs text-slate-500">The static routine used for daily substitutions.</p></div>
        </div>
        {classSections.length > 0 && (
          <label className="relative flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="sr-only">Class and section</span>
            <select className="appearance-none rounded-lg border bg-white py-2 pl-3 pr-9 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" value={selectedClass} onChange={(event) => onClassSectionChange?.(event.target.value)}>
              {classSections.map((classSection) => <option key={classSection.id} value={classSection.id}>Class {classSection.className}-{classSection.section}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 text-slate-400" size={15} />
          </label>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className={cn("w-full min-w-[760px] table-fixed text-sm", compact && "min-w-[680px]")}>
          <thead><tr className="bg-slate-50/80"><th className="w-20 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">Period</th>{SCHOOL_DAYS.map((day) => <th key={day} className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">{dayNames[day]}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {SCHOOL_PERIODS.map((period) => <tr key={period}>
              <th scope="row" className="bg-slate-50/45 px-4 py-3 text-left text-xs font-bold text-slate-500">P{period}</th>
              {SCHOOL_DAYS.map((day) => {
                const cell = timetableByKey.get(`${selectedClass}:${day}:${period}`);
                const subject = cell?.subjectId ? subjectById.get(cell.subjectId) : undefined;
                const teacher = cell?.assignedTeacherId ? teacherById.get(cell.assignedTeacherId) : undefined;
                return <td key={day} className="p-1.5 align-top">
                  <button type="button" className={cn("min-h-[76px] w-full rounded-lg border p-2 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-500/30", cell ? "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30" : "border-dashed border-slate-200 bg-slate-50/50 hover:border-emerald-300 hover:bg-emerald-50/40")} onClick={() => onCellSelect?.(cell, day, period)} aria-label={`${dayNames[day]} period ${period}${subject ? `, ${subject.name}` : ", free period"}`}>
                    {cell && subject ? <><p className="truncate font-semibold text-slate-800">{subject.name}</p><p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500"><UserRound size={12} />{teacher?.name ?? "Teacher unassigned"}</p>{cell.room && <p className="mt-1 text-[11px] text-slate-400">Room {cell.room}</p>}</> : <span className="flex h-full min-h-[42px] items-center justify-center text-xs font-medium text-emerald-600">Free</span>}
                  </button>
                </td>;
              })}
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}
