export const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type Period = (typeof PERIODS)[number];

export const CATEGORIES = ["PRT", "TGT", "PGT"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Teacher = {
  id: string;
  name: string;
  subject: string;
  category: Category;
  /** period -> true means BUSY (teaching), false/undefined means FREE */
  busy: Record<number, boolean>;
};

export type Absence = {
  teacherId: string;
  periods: number[];
};

export type Assignment = {
  period: number;
  absentTeacherId: string;
  absentTeacherName: string;
  subject: string;
  absentCategory?: Category;
  substituteId: string | null;
  substituteName: string;
  substituteCategory?: Category;
  reason: string;
};

const b = (...periods: number[]): Record<number, boolean> =>
  Object.fromEntries(periods.map((p) => [p, true]));

export const DEMO_TEACHERS: Teacher[] = [
  { id: "t1", name: "Anita Sharma", subject: "Mathematics", category: "PGT", busy: b(1, 2, 4, 6, 7) },
  { id: "t2", name: "Rahul Verma", subject: "Mathematics", category: "TGT", busy: b(2, 3, 5, 8) },
  { id: "t3", name: "Priya Nair", subject: "Physics", category: "PGT", busy: b(1, 3, 4, 7) },
  { id: "t4", name: "Sameer Khan", subject: "Physics", category: "TGT", busy: b(2, 5, 6) },
  { id: "t5", name: "Divya Menon", subject: "English", category: "TGT", busy: b(1, 2, 3, 6, 8) },
  { id: "t6", name: "Arjun Rao", subject: "English", category: "PRT", busy: b(4, 5, 7) },
  { id: "t7", name: "Neha Gupta", subject: "Chemistry", category: "PGT", busy: b(1, 4, 5, 8) },
  { id: "t8", name: "Vikram Singh", subject: "History", category: "TGT", busy: b(2, 3, 6, 7) },
  { id: "t9", name: "Meera Iyer", subject: "Biology", category: "PGT", busy: b(3, 4, 6) },
  { id: "t10", name: "Karan Joshi", subject: "Computer Science", category: "PRT", busy: b(1, 5, 7, 8) },
];

/**
 * Check if a substitute (with substituteCategory) can cover for an absent teacher (with absentCategory).
 * Hierarchy: PGT → TGT → PRT (higher can cover lower, but not vice versa)
 */
function canSubstitute(substituteCategory: Category, absentCategory: Category): boolean {
  if (substituteCategory === absentCategory) return true; // Same category can always substitute
  if (substituteCategory === "PGT") return true; // PGT can cover TGT or PRT
  if (substituteCategory === "TGT" && absentCategory === "PRT") return true; // TGT can cover PRT
  return false;
}

/**
 * Assign a free teacher to every absent period.
 * Priority: same subject first, then same/eligible category, then lowest substitution load today.
 */
export function generateSchedule(input: Teacher[], absences: Absence[]): Assignment[] {
  const teachers = input.map((t) => ({ ...t, busy: { ...t.busy } }));
  const load: Record<string, number> = {};
  const absentIds = new Set(absences.map((a) => a.teacherId));
  const byId = new Map(teachers.map((t) => [t.id, t]));


  const rows: { period: number; teacher: Teacher }[] = [];
  for (const a of absences) {
    const t = byId.get(a.teacherId);
    if (!t) continue;
    for (const p of a.periods) rows.push({ period: p, teacher: t });
  }
  rows.sort((x, y) => x.period - y.period || x.teacher.name.localeCompare(y.teacher.name));

  return rows.map(({ period, teacher }) => {
    // Filter candidates: must be free, not absent, and able to substitute
    const candidates = teachers.filter(
      (c) => c.id !== teacher.id && !absentIds.has(c.id) && !c.busy[period] && canSubstitute(c.category, teacher.category),
    );

    candidates.sort((c1, c2) => {
      // Priority 1: Same subject
      const s1 = c1.subject === teacher.subject ? 0 : 1;
      const s2 = c2.subject === teacher.subject ? 0 : 1;
      if (s1 !== s2) return s1 - s2;
      
      // Priority 2: Same category (exact match preferred over hierarchy)
      const cat1 = c1.category === teacher.category ? 0 : 1;
      const cat2 = c2.category === teacher.category ? 0 : 1;
      if (cat1 !== cat2) return cat1 - cat2;
      
      // Priority 3: Lowest substitution load today
      const l1 = load[c1.id] ?? 0;
      const l2 = load[c2.id] ?? 0;
      if (l1 !== l2) return l1 - l2;
      
      // Priority 4: Alphabetical
      return c1.name.localeCompare(c2.name);
    });

    const pick = candidates[0];
    if (!pick) {
      return {
        period,
        absentTeacherId: teacher.id,
        absentTeacherName: teacher.name,
        subject: teacher.subject,
        absentCategory: teacher.category,
        substituteId: null,
        substituteName: "— Unassigned —",
        reason: "No free teacher available in this period",
      };
    }

    load[pick.id] = (load[pick.id] ?? 0) + 1;
    // block the substitute so they are not double-booked
    pick.busy = { ...pick.busy, [period]: true };

    return {
      period,
      absentTeacherId: teacher.id,
      absentTeacherName: teacher.name,
      subject: teacher.subject,
      absentCategory: teacher.category,
      substituteId: pick.id,
      substituteName: pick.name,
      substituteCategory: pick.category,
      reason:
        pick.subject === teacher.subject
          ? `Same department (${pick.subject})`
          : `Free period · lowest load (${pick.subject})`,
    };
  });
}

export function toCsv(rows: Assignment[], dateLabel: string): string {
  const head = [
    "Date",
    "Period",
    "Absent Teacher",
    "Category",
    "Subject",
    "Substitute",
    "Substitute Category",
    "Reason",
  ];
  const body = rows.map((r) => [
    dateLabel,
    `P${r.period}`,
    r.absentTeacherName,
    r.absentCategory ?? "",
    r.subject,
    r.substituteName,
    r.substituteCategory ?? "",
    r.reason,
  ]);
  return [head, ...body]
    .map((line) => line.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}
