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
  const uniqueAttempted = new Set(allSubmissions.map(s => String(s.problemId))).size;
  const uniqueSolved = new Set(allSubmissions.filter(s => s.status === "Accepted").map(s => String(s.problemId))).size;
  const accuracy = uniqueAttempted > 0 ? Math.round((uniqueSolved / uniqueAttempted) * 100) : 0;
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

  // Last 7 days for legacy, but we will use fixed week for activity map
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  // Fixed week for Activity Chart (Monday to Sunday, or Sunday to Saturday. Let's do Monday to Sunday as it's common for developers)
  // Actually the user said "start from sunday and end at monday" which implies starting Sunday. Let's do Sunday to Saturday.
  const todayForWeek = new Date();
  const dayOfWeek = todayForWeek.getDay(); // 0 is Sunday
  const startOfWeek = new Date(todayForWeek);
  startOfWeek.setDate(todayForWeek.getDate() - dayOfWeek);
  
  const currentWeekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  const last30Days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });

  const heatmapMap = {};
  last30Days.forEach(date => heatmapMap[date] = { total: 0, accepted: 0 });

  const activityMap = {};
  currentWeekDates.forEach(date => activityMap[date] = new Set());

  allSubmissions.forEach(sub => {
    const dateStr = sub.createdAt.toISOString().slice(0, 10);
    
    // For heatmap
    if (heatmapMap[dateStr]) {
      heatmapMap[dateStr].total += 1;
      if (sub.status === "Accepted") {
        heatmapMap[dateStr].accepted += 1;
      }
    }

    // For 7-day activity chart
    if (activityMap[dateStr] && sub.status === "Accepted") {
      activityMap[dateStr].add(String(sub.problemId));
    }
  });

  const activityData = currentWeekDates.map(dateStr => {
    const d = new Date(dateStr);
    const dayName = d.toLocaleDateString("en-US", { weekday: 'short' });
    return {
      name: dayName,
      problems: activityMap[dateStr].size
    };
  });

  const heatmapData = last30Days.map(dateStr => {
    const data = heatmapMap[dateStr];
    const accuracy = data.total > 0 ? Math.round((data.accepted / data.total) * 100) : 0;
    return {
      date: dateStr,
      submissions: data.total,
      accepted: data.accepted,
      accuracy,
    };
  });

  return {
    solvedCount: acceptedIds.length,
    accuracy,
    streak,
    rank,
    recentSubmissions: submissions,
    todaysProblem: dailyChallenge?.problemId || null,
    activityData,
    heatmapData,
  };
};
