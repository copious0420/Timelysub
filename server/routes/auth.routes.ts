import type { Request, Response } from "express";
import { Router } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { env } from "../config/env";
import { requireAuth, requireRole } from "../middleware/auth";
import { School, User } from "../models";

export const authRoutes = Router();

const issueToken = (user: { _id: unknown; schoolId: unknown; role: string }) => {
  const token = jwt.sign(
    { userId: String(user._id), schoolId: String(user.schoolId), role: user.role },
    env.jwtSecret as jwt.Secret,
    { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] },
  );

  return token;
};

authRoutes.post(
  "/register-school",
  [
    body("name").trim().isLength({ min: 2 }),
    body("code").trim().isLength({ min: 2 }),
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, code, academicYear = "2026-27", email, password, profile = {} } = req.body;
      const existingSchool = await School.findOne({ code: String(code).toUpperCase() }).lean();
      if (existingSchool) {
        return res.status(409).json({ message: "School code already exists." });
      }

      const school = await School.create({
        name,
        code: String(code).toUpperCase(),
        academicYear,
      });

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({
        schoolId: school._id,
        email,
        passwordHash,
        role: "SCHOOL_ADMIN",
        mustChangePassword: false,
        profile: {
          name: profile.name ?? "School Admin",
          phone: profile.phone ?? "",
        },
      });

      const token = issueToken(user);
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      return res.status(201).json({ token, user: { id: user._id, role: user.role, schoolId: school._id } });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Unable to register school." });
    }
  },
);

authRoutes.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: String(email).toLowerCase() }).lean();

      if (!user || !(await bcrypt.compare(password, String(user.passwordHash)))) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      const token = issueToken(user);
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      return res.json({ token, user: { id: user._id, schoolId: user.schoolId, role: user.role, email: user.email } });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Unable to login." });
    }
  },
);

authRoutes.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("token");
  return res.json({ success: true });
});

authRoutes.get("/me", requireAuth, async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.userId).lean();
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  return res.json({ user });
});

authRoutes.get("/admin-check", requireAuth, requireRole("SCHOOL_ADMIN", "SUPER_ADMIN"), (_req: Request, res: Response) => {
  res.json({ ok: true, portal: "admin" });
});
