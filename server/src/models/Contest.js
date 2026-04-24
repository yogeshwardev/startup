import mongoose from "mongoose";

const contestProblemSchema = new mongoose.Schema(
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const contestParticipantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const contestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    problems: { type: [contestProblemSchema], default: [] },
    participants: { type: [contestParticipantSchema], default: [] },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Contest = mongoose.model("Contest", contestSchema);
