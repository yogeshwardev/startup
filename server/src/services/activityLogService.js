import { ActivityLog } from "../models/ActivityLog.js";

export const logActivity = async ({ actorId, targetUserId = null, action, message, metadata = {} }) =>
  ActivityLog.create({
    actorId,
    targetUserId,
    action,
    message,
    metadata,
  });
