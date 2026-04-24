import mongoose from "mongoose";

const violationSchema = new mongoose.Schema(
  {
    reason: { type: String, required: true, trim: true },
    eventType: { type: String, required: true, trim: true },
    warningCount: { type: Number, required: true, min: 1 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const practiceSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "TERMINATED", "SUBMITTED"],
      default: "ACTIVE",
    },
    warningCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    malpractice: {
      type: Boolean,
      default: false,
    },
    terminationReason: {
      type: String,
      default: "",
    },
    violations: {
      type: [violationSchema],
      default: [],
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const PracticeSession = mongoose.model(
  "PracticeSession",
  practiceSessionSchema
);
