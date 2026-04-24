import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    dueDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["Assigned", "Completed"],
      default: "Assigned",
    },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model("Assignment", assignmentSchema);
