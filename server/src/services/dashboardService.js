import { DailyChallenge } from "../models/DailyChallenge.js";
import { Submission } from "../models/Submission.js";
import { buildLeaderboards } from "./leaderboardService.js";
import { ensureDailyChallenge } from "./judgeService.js";

export const getUserDashboardSummary = async (user) => {
  const [submissions, acceptedIds, leaderboards, dailyChallenge] = await Promise.all([
    Submission.find({ userId: user._id }).sort({ createdAt: -1 }).limit(8).populate("problemId", "title slug difficulty"),
    Submission.distinct("problemId", { userId: user._id, status: "Accepted" }),
    buildLeaderboards(),
    ensureDailyChallenge(),
  ]);

  const allSubmissions = await Submission.find({ userId: user._id });
  const acceptedSubmissions = allSubmissions.filter((item) => item.status === "Accepted");
  const accuracy = allSubmissions.length ? Math.round((acceptedSubmissions.length / allSubmissions.length) * 100) : 0;
  const rank = leaderboards.global.findIndex((entry) => String(entry.userId) === String(user._id)) + 1 || null;

  let streak = 0;
  const challenges = await DailyChallenge.find({ "completions.userId": user._id }).sort({ date: -1 }).lean();
  let cursor = new Date();
  for (const challenge of challenges) {
    const expected = cursor.toISOString().slice(0, 10);
    if (challenge.date !== expected) {
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    solvedCount: acceptedIds.length,
    accuracy,
    streak,
    rank,
    recentSubmissions: submissions,
    todaysProblem: dailyChallenge?.problemId || null,
  };
};
