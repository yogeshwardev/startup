import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    solvedQuestions: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        companyName: String,
        solvedAt: {
          type: Date,
          default: Date.now,
        },
        attempts: {
          type: Number,
          default: 1,
        },
      },
    ],
    bookmarkedQuestions: [mongoose.Schema.Types.ObjectId],
    companyProgress: [
      {
        companyName: String,
        totalQuestionsAttempted: {
          type: Number,
          default: 0,
        },
        easyCount: { type: Number, default: 0 },
        mediumCount: { type: Number, default: 0 },
        hardCount: { type: Number, default: 0 },
        lastAccessed: Date,
      },
    ],
  },
  { timestamps: true }
);

export const UserProgress = mongoose.model("UserProgress", userProgressSchema);
