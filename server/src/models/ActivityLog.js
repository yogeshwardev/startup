import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "USER_CREATED",
        "USER_UPDATED",
        "USER_DELETED",
        "USER_PASSWORD_RESET",
        "USER_STATUS_CHANGED",
        "USER_BULK_DELETED",
      ],
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
