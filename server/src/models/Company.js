import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    logo: String,
    type: {
      type: String,
      enum: ["Mass Hiring", "Product Based"],
      required: true,
    },
    focusAreas: {
      type: [String],
      default: [],
    },
    interviewProcess: [
      {
        stage: String,
        description: String,
        duration: String,
      },
    ],
    description: String,
    website: String,
  },
  { timestamps: true }
);

export const Company = mongoose.model("Company", companySchema);
