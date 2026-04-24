import mongoose from "mongoose";

const streakEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const dailyChallengeSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    completions: { type: [streakEntrySchema], default: [] },
  },
  { timestamps: true }
);

export const DailyChallenge = mongoose.model("DailyChallenge", dailyChallengeSchema);
