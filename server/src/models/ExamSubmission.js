import mongoose from "mongoose";

const problemSubmissionSchema = new mongoose.Schema(
  {
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
    code: { type: String, default: "" },
    language: { type: String, default: "" },
    status: { type: String, enum: ["attempted", "accepted", "wrong_answer", "error", "not_attempted"], default: "not_attempted" },
    score: { type: Number, default: 0 },
    runOutput: { type: String, default: "" },
  },
  { _id: false }
);

const examSubmissionSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "MockTest", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    submissions: { type: [problemSubmissionSchema], default: [] },
    submittedAt: { type: Date, default: null },
    totalScore: { type: Number, default: 0 },
    warnings: { type: Number, default: 0 },
    terminated: { type: Boolean, default: false },
    terminationReason: { type: String, default: "" },
  },
  { timestamps: true }
);

examSubmissionSchema.index({ examId: 1, studentId: 1 }, { unique: true });

export const ExamSubmission = mongoose.model("ExamSubmission", examSubmissionSchema);
