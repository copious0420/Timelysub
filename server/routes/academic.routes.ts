import type { Request, Response } from "express";
import { Router } from "express";
import { body, validationResult } from "express-validator";

import { Absence, ClassSection, Subject, Teacher, TeacherAssignment } from "../models";
import { requireAuth } from "../middleware/auth";

export const academicRoutes = Router();

academicRoutes.use(requireAuth);

academicRoutes.get("/dashboard/overview", async (req: Request, res: Response) => {
  const [classCount, teacherCount, subjectCount, absenceCount] = await Promise.all([
    ClassSection.countDocuments({ schoolId: req.user?.schoolId }),
    Teacher.countDocuments({ schoolId: req.user?.schoolId }),
    Subject.countDocuments({ schoolId: req.user?.schoolId }),
    Absence.countDocuments({ schoolId: req.user?.schoolId }),
  ]);

  return res.json({
    status: "ok",
    metrics: {
      classes: classCount,
      teachers: teacherCount,
      subjects: subjectCount,
      absences: absenceCount,
    },
    generatedAt: new Date().toISOString(),
  });
});

academicRoutes.get("/classes", async (req: Request, res: Response) => {
  const classes = await ClassSection.find({ schoolId: req.user?.schoolId }).lean();
  return res.json({ classes });
});

academicRoutes.post(
  "/classes",
  [body("grade").isInt({ min: 6, max: 12 }), body("section").isString()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const created = await ClassSection.create({
      ...req.body,
      schoolId: req.user?.schoolId,
    });

    return res.status(201).json({ classSection: created });
  },
);

academicRoutes.get("/teachers", async (req: Request, res: Response) => {
  const teachers = await Teacher.find({ schoolId: req.user?.schoolId }).lean();
  return res.json({ teachers });
});

academicRoutes.post(
  "/teachers",
  [body("name").trim().isLength({ min: 2 }), body("qualificationCategory").isIn(["PRT", "TGT", "PGT"])],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const created = await Teacher.create({
      ...req.body,
      schoolId: req.user?.schoolId,
    });

    return res.status(201).json({ teacher: created });
  },
);

academicRoutes.get("/subjects", async (req: Request, res: Response) => {
  const subjects = await Subject.find({ schoolId: req.user?.schoolId }).lean();
  return res.json({ subjects });
});

academicRoutes.post(
  "/subjects",
  [body("name").trim().isLength({ min: 2 }), body("code").trim().isLength({ min: 2 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const created = await Subject.create({
      ...req.body,
      schoolId: req.user?.schoolId,
    });

    return res.status(201).json({ subject: created });
  },
);

academicRoutes.post("/allocations", async (req: Request, res: Response) => {
  const created = await TeacherAssignment.create({
    ...req.body,
    schoolId: req.user?.schoolId,
  });

  return res.status(201).json({ allocation: created });
});

academicRoutes.get("/allocations", async (req: Request, res: Response) => {
  const allocations = await TeacherAssignment.find({ schoolId: req.user?.schoolId }).lean();
  return res.json({ allocations });
});
