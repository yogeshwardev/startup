import { Problem } from "../models/Problem.js";
import { Submission } from "../models/Submission.js";
import { User } from "../models/User.js";
import { ActivityLog } from "../models/ActivityLog.js";

export const getAdminAnalytics = async () => {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [totalUsers, activeUsers, activeStudents, problemsSolvedPerDay, departmentPerformance, recentActivity] = await Promise.all([
    User.countDocuments(),
    Submission.distinct("userId", { createdAt: { $gte: since } }).then((items) => items.length),
    User.countDocuments({ role: "STUDENT", isBlocked: false }),
    Submission.aggregate([
      { $match: { status: "Accepted", createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          solved: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Submission.aggregate([
      { $match: { status: "Accepted" } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $group: {
          _id: "$user.department",
          score: { $sum: "$score" },
          solved: { $sum: 1 },
        },
      },
      { $sort: { score: -1 } },
    ]),
    ActivityLog.find().populate("actorId", "name role").sort({ createdAt: -1 }).limit(8).lean(),
  ]);

  return {
    totalUsers,
    activeUsers,
    activeStudents,
    problemsSolvedPerDay,
    departmentPerformance,
    totalProblems: await Problem.countDocuments(),
    recentActivity,
  };
};
