import { describe, expect, it } from "vitest";

import {
  buildSchoolTimetablePlan,
  canTeachGrade,
  generateMasterTimetable,
  validateTeacherAssignment,
  validateTeacherLoad,
  validateCombinedSectionAssignment,
} from "./timetableSolverService";
import { solve, validateTimetable, type CoreInput } from "./timetableEngine";
import {
  buildFallbackSubstitutionReason,
  getQualificationThresholdForGrade,
  pickBestSubstitute,
} from "./substitutionService";

describe("timetable qualification rules", () => {
  it("blocks TGT teachers from Grade 11 assignments", () => {
    expect(canTeachGrade("TGT", 11)).toBe(false);
    expect(canTeachGrade("PGT", 11)).toBe(true);
  });

  it("rejects overlapping single-occupancy teacher conflicts", () => {
    const result = validateTeacherAssignment({
      teacherCategory: "TGT",
      grade: 10,
      periodNumber: 3,
      teacherId: "teacher-1",
      classSectionId: "class-a",
      assignmentsByPeriod: [
        { teacherId: "teacher-1", classSectionId: "class-b", periodNumber: 3 },
        { teacherId: "teacher-2", classSectionId: "class-c", periodNumber: 3 },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.issues[0]).toContain("same period");
  });

  it("checks teacher load limits before approving a timetable", () => {
    const result = validateTeacherLoad({
      teacherId: "teacher-9",
      name: "Ms. Kapoor",
      dailyCount: 7,
      weeklyCount: 31,
      maxDaily: 6,
      maxWeekly: 30,
    });

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.includes("daily") || issue.includes("weekly"))).toBe(true);
  });

  it("allows explicitly combined section assignments when the conflict is intentional", () => {
    const result = validateCombinedSectionAssignment("teacher-9", 4, [
      { teacherId: "teacher-9", periodNumber: 4 },
      { teacherId: "teacher-9", periodNumber: 4 },
    ]);

    expect(result.valid).toBe(true);
    expect(result.count).toBe(2);
  });

  it("creates a valid master timetable without double-booked teachers", () => {
    const timetable = generateMasterTimetable({
      schoolId: "school-1",
      classSections: [
        { id: "6-A", grade: 6, section: "A" },
        { id: "10-A", grade: 10, section: "A" },
      ],
      assignments: {
        "6-A": [
          { subject: "English", teacherId: "t-1", teacherName: "Asha Verma", qualification: "TGT" },
          { subject: "Maths", teacherId: "t-2", teacherName: "Ravi Kumar", qualification: "TGT" },
          { subject: "Science", teacherId: "t-3", teacherName: "Nisha Shah", qualification: "TGT" },
          { subject: "Computer", teacherId: "t-4", teacherName: "Mohan Roy", qualification: "PGT" },
        ],
        "10-A": [
          { subject: "English", teacherId: "t-1", teacherName: "Asha Verma", qualification: "TGT" },
          { subject: "Maths", teacherId: "t-2", teacherName: "Ravi Kumar", qualification: "TGT" },
          { subject: "Science", teacherId: "t-3", teacherName: "Nisha Shah", qualification: "TGT" },
          { subject: "Physics", teacherId: "t-5", teacherName: "Amit Das", qualification: "PGT" },
        ],
      },
    });

    const teacherMap = new Map<string, number>();
    for (const slot of timetable.entries) {
      teacherMap.set(slot.teacherId, (teacherMap.get(slot.teacherId) ?? 0) + 1);
    }

    expect(timetable.entries.length).toBeGreaterThan(0);
    expect([...teacherMap.values()].some((count) => count > 8)).toBe(false);
  });

  it("builds a school-scoped timetable plan from real class and teacher records", () => {
    const plan = buildSchoolTimetablePlan({
      schoolId: "school-1",
      classSections: [
        { id: "10-A", grade: 10, section: "A" },
        { id: "11-A", grade: 11, section: "A" },
      ],
      teacherAssignments: [
        { classSectionId: "10-A", subject: "Maths", teacherId: "t-1", teacherName: "Asha Verma", qualification: "TGT" },
        { classSectionId: "11-A", subject: "Physics", teacherId: "t-2", teacherName: "Amit Das", qualification: "PGT" },
      ],
    });

    expect(plan.validation.passed).toBe(true);
    expect(plan.entries.length).toBeGreaterThan(0);
    expect(plan.entries.some((entry) => entry.classSectionId === "11-A" && entry.subject === "Physics")).toBe(true);
  });
});

describe("substitution ranking pipeline", () => {
  it("selects the same-subject specialist before a general expert", () => {
    const chosen = pickBestSubstitute(
      [
        { id: "teacher-a", name: "Alpha", qualificationCategory: "TGT", subjectId: "math", isAvailable: true },
        { id: "teacher-b", name: "Bravo", qualificationCategory: "PGT", subjectId: "physics", isAvailable: true },
      ],
      { subjectId: "math", grade: 10 },
    );

    expect(chosen?.candidate.name).toBe("Alpha");
  });

  it("uses the PGT threshold for senior grades", () => {
    expect(getQualificationThresholdForGrade(11)).toBe("PGT");
    expect(getQualificationThresholdForGrade(10)).toBe("TGT");
  });

  it("never selects a TGT or PRT as a substitute for senior grades", () => {
    const chosen = pickBestSubstitute([
      { id: "tgt", name: "TGT", qualificationCategory: "TGT", isAvailable: true },
      { id: "pgt", name: "PGT", qualificationCategory: "PGT", isAvailable: true },
    ], { grade: 11 });

    expect(chosen?.candidate.id).toBe("pgt");
  });

  it("falls back to a self-study reason when no candidate is available", () => {
    expect(buildFallbackSubstitutionReason()).toContain("self-study");
  });
});

describe("database-backed timetable engine rules", () => {
  it("places a daily-minimum subject every day without forcing other subjects daily", () => {
    const input: CoreInput = {
      classes: [{ id: "class-9a", grade: 9, label: "9-A" }],
      teachers: [
        { id: "science-teacher", name: "Dr. Rao", cat: "PGT", subjectIds: ["science", "computer"], maxPerDay: 6, maxPerWeek: 30 },
      ],
      subjects: [
        { id: "science", name: "Science", cat: "TGT", weekly: 6, minPerDay: 1, maxPerDay: 1, priority: 5, doublePeriod: false, grades: [], streams: [], classIds: ["class-9a"] },
        { id: "computer", name: "Computer", cat: "TGT", weekly: 2, minPerDay: 0, maxPerDay: 1, maxDaysPerWeek: 2, priority: 3, doublePeriod: false, grades: [], streams: [], classIds: ["class-9a"] },
      ],
      assignments: [
        { classId: "class-9a", subjectId: "science", teacherId: "science-teacher" },
        { classId: "class-9a", subjectId: "computer", teacherId: "science-teacher" },
      ],
    };

    const result = solve(input, { seed: 9 });
    expect(result.ok).toBe(true);
    expect(result.slots.filter((slot) => slot.subjectId === "science").map((slot) => slot.day)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(new Set(result.slots.filter((slot) => slot.subjectId === "computer").map((slot) => slot.day)).size).toBeLessThanOrEqual(2);
    expect(validateTimetable(input, result.slots)).toEqual([]);
  });

  it("keeps senior-grade qualification rules unbreakable for forced assignments", () => {
    const input: CoreInput = {
      classes: [{ id: "class-11a", grade: 11, label: "11-A" }],
      teachers: [{ id: "tgt-1", name: "Ms. Sen", cat: "TGT", subjectIds: ["physics"], maxPerDay: 6, maxPerWeek: 30 }],
      subjects: [{ id: "physics", name: "Physics", cat: "PGT", weekly: 1, minPerDay: 0, maxPerDay: 1, priority: 5, doublePeriod: false, grades: [11], streams: [], classIds: ["class-11a"] }],
      assignments: [{ classId: "class-11a", subjectId: "physics", teacherId: "tgt-1", isForced: true }],
    };

    const result = solve(input);
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toContain("classes 11 and 12 can only be taught by a PGT");
  });
});
