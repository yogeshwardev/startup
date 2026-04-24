import mongoose from "mongoose";

const archiveResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["notes", "interview", "tips"], required: true },
    content: { type: String, required: true },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: { type: String, default: "All" },
  },
  { timestamps: true }
);

export const ArchiveResource = mongoose.model("ArchiveResource", archiveResourceSchema);
