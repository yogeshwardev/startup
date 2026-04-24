import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export const Department = mongoose.model("Department", departmentSchema);
