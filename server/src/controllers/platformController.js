import mongoose from "mongoose";
import { Contest } from "../models/Contest.js";
import { Assignment } from "../models/Assignment.js";
import { Submission } from "../models/Submission.js";
import { Problem } from "../models/Problem.js";
import { buildDepartmentWar, buildLeaderboards } from "../services/leaderboardService.js";
import { ensureDailyChallenge } from "../services/judgeService.js";
import { getUserDashboardSummary } from "../services/dashboardService.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ApiError } from "../utils/ApiError.js";

const sanitizeContest = async (contest) => {
  const sortedProblems = [...contest.problems].sort(
    (left, right) => left.order - right.order
  );
  const normalizedProblems = sortedProblems.filter((entry) => entry.problemId);

  if (normalizedProblems.length !== sortedProblems.length) {
    await Contest.updateOne(
      { _id: contest._id },
      {
        $set: {
          problems: normalizedProblems.map((entry, index) => ({
            problemId: entry.problemId._id || entry.problemId,
            order: index + 1,
          })),
        },
      }
    );
  }

  return {
    ...contest.toObject(),
    problems: normalizedProblems,
  };
};

export const getLeaderboards = catchAsync(async (_req, res) => {
  res.json(await buildLeaderboards());
});

export const getDepartmentWar = catchAsync(async (_req, res) => {
  res.json(await buildDepartmentWar());
});

export const getDepartmentLeaderboard = catchAsync(async (_req, res) => {
  const data = await buildDepartmentWar();
  res.json(data.departments);
});

export const getDashboardSummary = catchAsync(async (req, res) => {
  res.json(await getUserDashboardSummary(req.user));
});

export const getDailyChallenge = catchAsync(async (_req, res) => {
  res.json(await ensureDailyChallenge());
});

export const getContests = catchAsync(async (_req, res) => {
  const contests = await Contest.find()
    .populate("problems.problemId", "title slug difficulty problemCode")
    .sort({ startTime: 1 });
  res.json(await Promise.all(contests.map((contest) => sanitizeContest(contest))));
});

export const getContestById = catchAsync(async (req, res) => {
  const contest = await Contest.findById(req.params.id)
    .populate("problems.problemId")
    .populate("participants.userId", "name department");
  if (!contest) {
    throw new ApiError(404, "Contest not found.");
  }

  const normalizedContest = await sanitizeContest(contest);
  const submittedProblemIds = await Submission.distinct("problemId", {
    userId: req.user._id,
    contestId: contest._id,
  });

  const scoreboard = await Submission.aggregate([
    { $match: { contestId: contest._id, status: "Accepted" } },
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
        _id: "$userId",
        name: { $first: "$user.name" },
        department: { $first: "$user.department" },
        solved: { $sum: 1 },
        penaltyTime: { $sum: "$runtime" },
      },
    },
    { $sort: { solved: -1, penaltyTime: 1, name: 1 } },
  ]);

  res.json({
    ...normalizedContest,
    leaderboard: scoreboard,
    submittedProblemIds: submittedProblemIds.map(String),
  });
});

export const createContest = catchAsync(async (req, res) => {
  const requestedProblems = (req.body.problems || [])
    .map((item, index) => {
      if (typeof item === "string") {
        return { ref: item, order: index + 1 };
      }

      if (item?.problemId || item?.problemCode) {
        return {
          ref: item.problemId || item.problemCode,
          order: Number.isFinite(item.order) ? item.order : index + 1,
        };
      }

      return null;
    })
    .filter(Boolean);

  if (!requestedProblems.length) {
    throw new ApiError(400, "Contest must include at least one valid problem.");
  }

  const startTime = new Date(req.body.startTime);
  const endTime = new Date(req.body.endTime);

  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    throw new ApiError(400, "Contest dates are invalid.");
  }

  if (endTime <= startTime) {
    throw new ApiError(400, "Contest end time must be after start time.");
  }

  const normalizedProblems = [];

  for (const item of requestedProblems) {
    const lookup = [{ problemCode: item.ref }];

    if (mongoose.isValidObjectId(item.ref)) {
      lookup.push({ _id: item.ref });
    }

    const problem = await Problem.findOne({
      $or: lookup,
    }).select("_id problemCode");

    if (!problem) {
      throw new ApiError(400, `Problem ${item.ref} does not exist.`);
    }

    normalizedProblems.push({
      problemId: problem._id,
      order: item.order,
    });
  }

  const contest = await Contest.create({
    title: req.body.title,
    description: req.body.description || "",
    startTime,
    endTime,
    problems: normalizedProblems,
  });

  res.status(201).json(contest);
});

export const getTeacherAssignments = catchAsync(async (req, res) => {
  const query = req.user.role === "TEACHER" ? { teacherId: req.user._id } : {};
  const assignments = await Assignment.find(query)
    .populate("studentId", "name department year")
    .populate("problemId", "title slug difficulty problemCode")
    .sort({ createdAt: -1 });
  res.json(assignments);
});

export const assignProblem = catchAsync(async (req, res) => {
  const assignment = await Assignment.create({
    teacherId: req.user._id,
    studentId: req.body.studentId,
    problemId: req.body.problemId,
    dueDate: req.body.dueDate || null,
  });
  res.status(201).json(assignment);
});

export const getAdminPanelSummary = catchAsync(async (_req, res) => {
  const [problemCount, contestCount, submissionCount] = await Promise.all([
    Problem.countDocuments(),
    Contest.countDocuments(),
    Submission.countDocuments(),
  ]);

  res.json({ problemCount, contestCount, submissionCount });
});
