import { Submission } from "../models/Submission.js";
import { Department } from "../models/Department.js";

const buildUserAggregate = (match = {}) => [
  { $match: { status: "Accepted", ...match } },
  {
    $group: {
      _id: {
        userId: "$userId",
        problemId: "$problemId",
      },
      score: { $max: "$score" },
      runtime: { $min: "$runtime" },
    },
  },
  {
    $group: {
      _id: "$_id.userId",
      solved: { $sum: 1 },
      score: { $sum: "$score" },
      runtime: { $avg: "$runtime" },
    },
  },
  {
    $group: {
      _id: "$_id",
      solved: { $max: "$solved" },
      score: { $max: "$score" },
      runtime: { $max: "$runtime" },
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "user",
    },
  },
  { $unwind: "$user" },
  {
    $project: {
      _id: 0,
      userId: "$user._id",
      name: "$user.name",
      department: "$user.department",
      year: "$user.year",
      score: 1,
      solved: 1,
      runtime: { $round: ["$runtime", 2] },
    },
  },
  { $sort: { solved: -1, score: -1, runtime: 1, name: 1 } },
];

export const buildLeaderboards = async () => {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const [global, weekly, department] = await Promise.all([
    Submission.aggregate(buildUserAggregate()),
    Submission.aggregate(buildUserAggregate({ createdAt: { $gte: weekStart } })),
    Submission.aggregate([
      { $match: { status: "Accepted" } },
      {
        $group: {
          _id: {
            userId: "$userId",
            problemId: "$problemId",
          },
          score: { $max: "$score" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $group: {
          _id: "$user.department",
          points: { $sum: "$score" },
          solved: { $sum: 1 },
        },
      },
      { $sort: { points: -1, solved: -1, _id: 1 } },
    ]),
  ]);

  return { global, weekly, department };
};

export const buildDepartmentWar = async () => {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const [departments, contributors] = await Promise.all([
    Submission.aggregate([
      { $match: { status: "Accepted", createdAt: { $gte: weekStart } } },
      {
        $group: {
          _id: {
            userId: "$userId",
            problemId: "$problemId",
          },
          score: { $max: "$score" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $group: {
          _id: "$user.department",
          points: { $sum: "$score" },
          solved: { $sum: 1 },
        },
      },
      { $sort: { points: -1, solved: -1 } },
    ]),
    Submission.aggregate([
      { $match: { status: "Accepted", createdAt: { $gte: weekStart } } },
      {
        $group: {
          _id: {
            userId: "$userId",
            problemId: "$problemId",
          },
          score: { $max: "$score" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $group: {
          _id: {
            userId: "$user._id",
            department: "$user.department",
            name: "$user.name",
          },
          points: { $sum: "$score" },
          solved: { $sum: 1 },
        },
      },
      { $sort: { points: -1, solved: -1 } },
      { $limit: 10 },
    ]),
  ]);

  await Promise.all(
    departments.map((entry) =>
      Department.updateOne(
        { name: entry._id },
        { $set: { totalPoints: entry.points } },
        { upsert: false }
      )
    )
  );

  return { departments, topContributors: contributors };
};
