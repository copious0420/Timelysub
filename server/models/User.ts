import type { Document, InferSchemaType } from "mongoose";
import mongoose, { Schema } from "mongoose";

export const USER_ROLES = ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER", "STUDENT"] as const;

const userSchema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true },
    mustChangePassword: { type: Boolean, default: false },
    profile: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

export type IUser = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export type UserDocument = Document & IUser;

export const User = mongoose.model<UserDocument>("User", userSchema);
