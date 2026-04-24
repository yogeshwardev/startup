import mongoose from "mongoose";

const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, default: "" },
    output: { type: String, default: "" },
    explanation: { type: String, default: "" },
  },
  { _id: false }
);

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    explanation: { type: String, default: "" },
    isHidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const starterCodeSchema = new mongoose.Schema(
  {
    python: { type: String, default: "" },
    cpp: { type: String, default: "" },
    java: { type: String, default: "" },
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    problemCode: {
      type: String,
      unique: true,
      sparse: true,
      match: /^\d{6}$/,
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    tags: { type: [String], default: [] },
    constraints: { type: [String], default: [] },
    inputFormat: { type: String, default: "" },
    outputFormat: { type: String, default: "" },
    examples: { type: [exampleSchema], default: [] },
    visibleTestCases: { type: [testCaseSchema], default: [] },
    hiddenTestCases: { type: [testCaseSchema], default: [] },
    starterCode: { type: starterCodeSchema, default: () => ({}) },
    supportedLanguages: {
      type: [String],
      enum: ["python", "cpp", "java"],
      default: ["python", "cpp", "java"],
    },
    timeLimitMs: { type: Number, default: 2000 },
    memoryLimitMb: { type: Number, default: 256 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDailyEligible: { type: Boolean, default: true },
    editorial: { type: String, default: "" },
  },
  { timestamps: true }
);

problemSchema.index({ title: "text", tags: "text" });
problemSchema.index({ problemCode: 1 });

export const Problem = mongoose.model("Problem", problemSchema);
