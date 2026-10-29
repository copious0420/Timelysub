import mongoose from "mongoose";
import type { Request, Response } from "express";
import { Router } from "express";
import { body, validationResult } from "express-validator";

import { ClassSection, MasterTimetable, Subject, Teacher, TeacherAssignment } from "../models";
import { requireAuth } from "../middleware/auth";
import { solve, validateTimetable, type CoreAssignment, type CoreClass, type CoreInput, type CoreSlot, type CoreSubject, type CoreTeacher } from "../services/timetableEngine";

export const timetableRoutes = Router();

// This path is intentionally protected to match the enterprise admin workflow.
timetableRoutes.use(requireAuth);

timetableRoutes.post(
  "/generate",
  [body("schoolId").optional().isString()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const schoolId = req.user?.schoolId ?? req.body.schoolId;
    if (!schoolId) {
      return res.status(400).json({ message: "School context is required to generate a timetable." });
    }

    const [classSections, teacherRecords, subjectRecords, teacherAssignments, existingSlots] = await Promise.all([
      ClassSection.find({ schoolId }).lean(),
      Teacher.find({ schoolId }).lean(),
      Subject.find({ schoolId }).lean(),
      TeacherAssignment.find({ schoolId }).populate("subjectId teacherId").lean(),
      MasterTimetable.find({ schoolId }).lean(),
    ]);

    if (!classSections.length) {
      return res.status(404).json({ message: "No classes found for this school." });
    }

    if (!subjectRecords.length) {
      return res.status(400).json({ message: "Create subjects and teacher assignments before generating a timetable." });
    }

    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const coreClasses: CoreClass[] = classSections.map((schoolClass) => ({
      id: String(schoolClass._id), grade: Number(schoolClass.grade), label: `${schoolClass.grade}-${schoolClass.section}`,
      stream: schoolClass.stream ? String(schoolClass.stream) : undefined,
    }));
    const classById = new Map(coreClasses.map((schoolClass) => [schoolClass.id, schoolClass]));
    const subjectById = new Map(subjectRecords.map((subject) => [String(subject._id), subject]));
    const teacherById = new Map<string, CoreTeacher>(teacherRecords.map((teacher) => [String(teacher._id), {
      id: String(teacher._id), name: String(teacher.name), cat: teacher.qualificationCategory,
      subjectIds: [], maxPerDay: Number(teacher.maxPeriodsPerDay), maxPerWeek: Number(teacher.maxPeriodsPerWeek),
    }]));
    const assignmentByPair = new Map<string, { teacherId: string; weekly: number; forced: boolean }>();
    for (const record of teacherAssignments as any[]) {
      const classId = String(record.classSectionId?._id ?? record.classSectionId ?? "");
      const subjectId = String(record.subjectId?._id ?? record.subjectId ?? "");
      const teacherId = String(record.teacherId?._id ?? record.teacherId ?? "");
      if (!classById.has(classId) || !subjectById.has(subjectId) || !teacherById.has(teacherId)) continue;
      assignmentByPair.set(`${classId}|${subjectId}`, {
        teacherId,
        weekly: record.weeklyPeriodsNeeded == null ? Number(subjectById.get(subjectId)?.weeklyPeriods ?? 4) : Number(record.weeklyPeriodsNeeded),
        forced: !!record.isForced,
      });
    }

    const coreSubjects: CoreSubject[] = [];
    const subjectIdByCoreId = new Map<string, string>();
    const coreSubjectId = (classId: string, subjectId: string): string => `${classId}|${subjectId}`;
    for (const schoolClass of coreClasses) {
      for (const [actualId, record] of subjectById) {
        const grades = (record.grades ?? []).map(Number);
        const streams = (record.streams ?? []).map(String);
        if ((grades.length && !grades.includes(schoolClass.grade)) || (streams.length && (!schoolClass.stream || !streams.includes(schoolClass.stream)))) continue;
        const coreId = coreSubjectId(schoolClass.id, actualId);
        const assignment = assignmentByPair.get(`${schoolClass.id}|${actualId}`);
        coreSubjects.push({
          id: coreId, name: String(record.name), cat: record.categoryRequired, weekly: assignment?.weekly ?? Number(record.weeklyPeriods ?? 4),
          minPerDay: Number(record.minPerDay), maxPerDay: Number(record.maxPerDay), maxDaysPerWeek: Number(record.maxDaysPerWeek),
          priority: Number(record.priority), doublePeriod: !!record.isLabDoublePeriod, grades, streams, classIds: [schoolClass.id],
        });
        subjectIdByCoreId.set(coreId, actualId);
        if (assignment) teacherById.get(assignment.teacherId)?.subjectIds.push(coreId);
      }
    }

    const coreAssignments: CoreAssignment[] = [];
    for (const [pair, assignment] of assignmentByPair) {
      const [classId, actualSubjectId] = pair.split("|");
      coreAssignments.push({ classId, subjectId: coreSubjectId(classId, actualSubjectId), teacherId: assignment.teacherId, isForced: assignment.forced });
    }
    const coreIdByPair = new Map(coreSubjects.map((subject) => [subject.id, subject.id]));
    const locked: CoreSlot[] = existingSlots.filter((slot) => slot.isLocked).flatMap((slot) => {
      const classId = String(slot.classSectionId), actualSubjectId = String(slot.subjectId);
      const subjectId = coreIdByPair.get(coreSubjectId(classId, actualSubjectId));
      const day = dayNames.indexOf(String(slot.dayOfWeek));
      if (!subjectId || day < 0) return [];
      return [{ classId, subjectId, teacherId: String(slot.teacherId), day, period: Number(slot.periodNumber), isLocked: true }];
    });
    const engineInput: CoreInput = { classes: coreClasses, subjects: coreSubjects, teachers: [...teacherById.values()], assignments: coreAssignments, locked };
    const solved = solve(engineInput);
    const validationErrors = solved.ok ? validateTimetable(engineInput, solved.slots) : [];
    if (!solved.ok || validationErrors.length) {
      return res.status(409).json({
        message: "The timetable could not be generated under the current school constraints.",
        errors: [...solved.errors, ...validationErrors], attempts: solved.attempts, steps: solved.steps,
      });
    }

    const schoolObjectId = new mongoose.Types.ObjectId(String(schoolId));
    const documents = solved.slots.map((slot) => ({
      schoolId: schoolObjectId,
      classSectionId: new mongoose.Types.ObjectId(slot.classId),
      dayOfWeek: dayNames[slot.day],
      periodNumber: slot.period,
      subjectId: new mongoose.Types.ObjectId(subjectIdByCoreId.get(slot.subjectId)!),
      teacherId: new mongoose.Types.ObjectId(slot.teacherId),
      isLocked: !!slot.isLocked,
      isForced: !!slot.isForced,
    }));
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await MasterTimetable.deleteMany({ schoolId: schoolObjectId }, { session });
        if (documents.length) await MasterTimetable.insertMany(documents, { session });
      });
    } finally {
      await session.endSession();
    }

    const classLabels = new Map(coreClasses.map((schoolClass) => [schoolClass.id, schoolClass.label]));
    const responseEntries = solved.slots.map((slot) => {
      const record = subjectById.get(subjectIdByCoreId.get(slot.subjectId)!);
      const teacher = teacherById.get(slot.teacherId)!;
      return {
        classSectionId: slot.classId, className: classLabels.get(slot.classId), day: dayNames[slot.day], periodNumber: slot.period,
        subject: record?.name, teacherId: slot.teacherId, teacherName: teacher.name, qualification: teacher.cat,
        isLocked: !!slot.isLocked, isForced: !!slot.isForced,
      };
    });
    return res.json({
      timetable: { schoolId: String(schoolId), generatedAt: new Date().toISOString(), entries: responseEntries,
        validation: { passed: true, checks: ["Qualification and fixed-assignment rules validated", "Class and teacher clashes checked", "Teacher and subject loads checked", "Independent validation passed"], issues: [] } },
      generatedAt: new Date().toISOString(), attempts: solved.attempts, steps: solved.steps, durationMs: solved.ms,
    });
  },
);

timetableRoutes.get("/class/:classSectionId", async (req: Request, res: Response) => {
  const entries = await MasterTimetable.find({ schoolId: req.user?.schoolId, classSectionId: req.params.classSectionId }).lean();
  return res.json({ entries });
});

timetableRoutes.get("/teacher/:teacherId", async (req: Request, res: Response) => {
  const entries = await MasterTimetable.find({ schoolId: req.user?.schoolId, teacherId: req.params.teacherId }).lean();
  return res.json({ entries });
});
