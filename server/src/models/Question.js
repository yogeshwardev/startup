import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["coding", "aptitude", "interview"],
      required: true,
    },
    category: String,
    topic: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    // For Aptitude Questions
    options: [String],
    correctOptionIndex: Number,
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    constraints: [String],
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    solution: {
      approach: String,
      code: String,
      language: {
        type: String,
        default: "javascript",
      },
      complexity: {
        time: String,
        space: String,
      },
    },
    tags: [String],
    hints: [String],
  },
  { timestamps: true }
);

export const Question = mongoose.model("Question", questionSchema);
