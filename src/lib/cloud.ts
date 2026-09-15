import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORIES,
  type Assignment,
  type Category,
  type Teacher,
  type TimetablePeriod,
} from "@/lib/substitution";
import type { SavedSchedule } from "@/lib/history";

const toCategory = (v: string): Category =>
  (CATEGORIES as readonly string[]).includes(v) ? (v as Category) : "TGT";

export type Profile = {
  fullName: string;
  schoolName: string;
  schoolId: string;
  studentPasscode: string;
};

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, school_name, school_id, student_passcode")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    fullName: data.full_name,
    schoolName: data.school_name,
    schoolId: data.school_id,
    studentPasscode: data.student_passcode,
  };
}

export async function upsertProfile(userId: string, profile: Profile) {
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      full_name: profile.fullName,
      school_name: profile.schoolName,
      school_id: profile.schoolId,
      student_passcode: profile.studentPasscode,
    });
  if (error) throw error;
}

export async function verifyStudentAccess(schoolId: string, studentPasscode: string) {
  const { data, error } = await supabase.rpc("verify_student_access", {
    requested_school_id: schoolId,
    requested_passcode: studentPasscode,
  });
  if (error) throw error;
  return data;
}

export async function fetchTeachers(): Promise<Teacher[]> {
  const { data, error } = await supabase
    .from("teachers")
    .select("id, name, subject, category, busy, timetable, weekly_timetable")
    .order("name");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    subject: r.subject,
    category: toCategory(r.category),
    busy: (r.busy ?? {}) as Record<number, boolean>,
    timetable: (r.timetable ?? {}) as Record<number, TimetablePeriod>,
    weeklyTimetable: (r.weekly_timetable ?? {}) as Record<number, Record<number, TimetablePeriod>>,
  }));
}

/** Replaces the stored teacher schedule with `teachers` for the signed-in user. */
export async function syncTeachers(userId: string, teachers: Teacher[]) {
  const ids = teachers.map((t) => t.id);
  if (teachers.length > 0) {
    const { error } = await supabase.from("teachers").upsert(
      teachers.map((t) => ({
        id: t.id,
        user_id: userId,
        name: t.name,
        subject: t.subject,
        category: t.category,
        busy: t.busy,
        timetable: t.timetable ?? {},
        weekly_timetable: t.weeklyTimetable ?? {},
      })),
    );
    if (error) throw error;
  }
  let del = supabase.from("teachers").delete().eq("user_id", userId);
  if (ids.length > 0) del = del.not("id", "in", `(${ids.map((i) => `"${i}"`).join(",")})`);
  const { error: delError } = await del;
  if (delError) throw delError;
}

export async function fetchSavedDays(): Promise<SavedSchedule[]> {
  const { data, error } = await supabase
    .from("saved_schedules")
    .select("day, rows, updated_at")
    .order("day", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    date: r.day,
    savedAt: r.updated_at,
    rows: (r.rows ?? []) as unknown as Assignment[],
  }));
}

export async function saveDay(userId: string, date: string, rows: Assignment[]) {
  const { error } = await supabase
    .from("saved_schedules")
    .upsert(
      { user_id: userId, day: date, rows: rows as unknown as never },
      { onConflict: "user_id,day" },
    );
  if (error) throw error;
}

export async function deleteDay(userId: string, date: string) {
  const { error } = await supabase
    .from("saved_schedules")
    .delete()
    .eq("user_id", userId)
    .eq("day", date);
  if (error) throw error;
}
