import type { Document, InferSchemaType } from "mongoose";
import mongoose, { Schema } from "mongoose";

export const SCHOOL_PERIODS_PER_DAY = 8;

const timingSlotSchema = new Schema(
  {
    periodNumber: { type: Number, required: true, min: 1 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBreak: { type: Boolean, default: false },
  },
  { _id: true },
);

const schoolSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    academicYear: { type: String, required: true },
    periodsPerDay: { type: Number, default: SCHOOL_PERIODS_PER_DAY, min: 1, max: 12 },
    timingSlots: { type: [timingSlotSchema], default: [] },
  },
  { timestamps: true },
);

export type ISchool = InferSchemaType<typeof schoolSchema> & {
  _id: mongoose.Types.ObjectId;
};

export type SchoolDocument = Document & ISchool;

export const School = mongoose.model<SchoolDocument>("School", schoolSchema);
