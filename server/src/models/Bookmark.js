import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

bookmarkSchema.index({ userId: 1, problemId: 1 }, { unique: true });

export const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
