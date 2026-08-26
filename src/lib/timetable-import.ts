import * as XLSX from "xlsx";
import { PERIODS, type Teacher } from "./substitution";

export type ImportResult = {
  teachers: Teacher[];
  warnings: string[];
};

const FREE_TOKENS = new Set(["", "-", "--", "free", "f", "0", "no", "n", "na", "n/a", "off", "idle"]);

const norm = (v: unknown) =>
  String(v ?? "")
    .replace(/\s+/g, " ")
    .trim();

/** Which column index holds which period (1..8) */
function detectPeriodColumns(header: string[]): Record<number, number> {
  const map: Record<number, number> = {};
  header.forEach((raw, idx) => {
    const h = norm(raw).toLowerCase();
    if (!h) return;
    const m = h.match(/^(?:p|period|per|prd)?\s*[-_ ]?0?([1-8])$/);
    if (m) {
      const p = Number(m[1]);
      if (map[p] === undefined) map[p] = idx;
    }
  });
  return map;
}

function findColumn(header: string[], keys: string[]) {
  for (let i = 0; i < header.length; i++) {
    const h = norm(header[i]).toLowerCase();
    if (keys.some((k) => h === k || h.includes(k))) return i;
  }
  return -1;
}

/** Parse an xlsx / xls / csv / ods file into teachers with Free/Busy period slots. */
export async function parseTimetableFile(file: File): Promise<ImportResult> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error("The file has no sheets.");
  const sheet = wb.Sheets[sheetName]!;
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false, defval: "" });
  if (!rows.length) throw new Error("The first sheet is empty.");

  // Find the header row: the first row that exposes at least 3 period columns.
  let headerIdx = -1;
  let periodCols: Record<number, number> = {};
  for (let i = 0; i < Math.min(rows.length, 25); i++) {
    const header = (rows[i] ?? []).map(norm);
    const cols = detectPeriodColumns(header);
    if (Object.keys(cols).length >= 3) {
      headerIdx = i;
      periodCols = cols;
      break;
    }
  }
  if (headerIdx === -1)
    throw new Error(
      "Could not find period columns. Use a header row with columns: Teacher, Subject, P1 … P8.",
    );

  const header = (rows[headerIdx] ?? []).map(norm);
  const nameCol = findColumn(header, ["teacher", "name", "faculty", "staff"]);
  const subjectCol = findColumn(header, ["subject", "department", "dept", "stream"]);
  if (nameCol === -1)
    throw new Error("Could not find a teacher name column. Add a header cell named 'Teacher'.");

  const warnings: string[] = [];
  const missing = PERIODS.filter((p) => periodCols[p] === undefined);
  if (missing.length) warnings.push(`No column found for period(s) ${missing.join(", ")} — treated as Free.`);

  const teachers: Teacher[] = [];
  const seen = new Set<string>();

  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r] ?? [];
    const name = norm(row[nameCol]);
    if (!name) continue;
    const lower = name.toLowerCase();
    if (lower === "teacher" || lower === "name") continue;
    if (seen.has(lower)) {
      warnings.push(`Duplicate row for "${name}" was skipped.`);
      continue;
    }
    seen.add(lower);

    const busy: Record<number, boolean> = {};
    const codes: string[] = [];
    for (const p of PERIODS) {
      const col = periodCols[p];
      if (col === undefined) continue;
      const cell = norm(row[col]);
      const isFree = FREE_TOKENS.has(cell.toLowerCase());
      if (!isFree) {
        busy[p] = true;
        codes.push(cell);
      }
    }

    let subject = subjectCol === -1 ? "" : norm(row[subjectCol]);
    if (!subject) {
      // Infer from the most frequent busy-cell label (e.g. "Maths 8A").
      const counts = new Map<string, number>();
      for (const c of codes) {
        const key = c.split(/[-–/|,(]/)[0]!.replace(/\b\d+[A-Za-z]?\b/g, "").trim();
        if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      subject = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "General";
    }

    teachers.push({
      id: `imp${r}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      subject,
      busy,
    });
  }

  if (!teachers.length) throw new Error("No teacher rows were found below the header.");
  return { teachers, warnings };
}

/** Merge imported teachers into an existing roster, matching by name. */
export function mergeTeachers(existing: Teacher[], imported: Teacher[]): Teacher[] {
  const byName = new Map(existing.map((t) => [t.name.trim().toLowerCase(), t]));
  const result = [...existing];
  for (const imp of imported) {
    const match = byName.get(imp.name.trim().toLowerCase());
    if (match) {
      const idx = result.findIndex((t) => t.id === match.id);
      result[idx] = { ...match, subject: imp.subject || match.subject, busy: imp.busy };
    } else {
      result.push(imp);
    }
  }
  return result;
}

export function downloadTimetableTemplate() {
  const header = ["Teacher", "Subject", ...PERIODS.map((p) => `P${p}`)];
  const rows = [
    ["Anita Sharma", "Mathematics", "Maths 8A", "Maths 9B", "Free", "Maths 7C", "Free", "Maths 10A", "Free", "Free"],
    ["Rahul Verma", "Physics", "Free", "Phy 11A", "Phy 12B", "Free", "Free", "Phy 11C", "Free", "Free"],
  ];
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Timetable");
  XLSX.writeFile(wb, "timely-timetable-template.xlsx");
}
