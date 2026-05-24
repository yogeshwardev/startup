import mongoose from "mongoose";

const mockQuestionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    type: { type: String, enum: ["mcq", "coding"], required: true },
    options: { type: [String], default: [] },
    correctAnswer: { type: String, default: "" },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      default: null,
    },
    points: { type: Number, default: 1 },
  },
  { _id: false }
);

const mockTestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    durationMinutes: { type: Number, default: 60 },
    company: { type: String, default: "" },
    language: {
      type: String,
      enum: ["python", "cpp", "java", "javascript", "c"],
      required: true,
      default: "python",
    },
    scheduledFor: { type: Date, default: null },
    questions: { type: [mockQuestionSchema], default: [] },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const MockTest = mongoose.model("MockTest", mockTestSchema);
