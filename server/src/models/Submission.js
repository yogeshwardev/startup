import mongoose from "mongoose";
import { SUPPORTED_LANGUAGES } from "../constants/languages.js";

const testResultSchema = new mongoose.Schema(
  {
    input: { type: String, default: "" },
    expectedOutput: { type: String, default: "" },
    actualOutput: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error"],
      default: "Wrong Answer",
    },
    runtime: { type: Number, default: 0 },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
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
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      default: null,
    },
    code: { type: String, required: true },
    language: { type: String, enum: SUPPORTED_LANGUAGES, required: true },
    status: {
      type: String,
      enum: ["Queued", "Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error"],
      default: "Queued",
    },
    runtime: { type: Number, default: 0 },
    memory: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    passedCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    stdout: { type: String, default: "" },
    stderr: { type: String, default: "" },
    testResults: { type: [testResultSchema], default: [] },
    isDailyChallenge: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Submission = mongoose.model("Submission", submissionSchema);
