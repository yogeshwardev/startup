import { Submission } from "../models/Submission.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getSubmissionsByUser = catchAsync(async (req, res) => {
  const userId = req.user.role === "STUDENT" ? req.user._id : req.params.userId;
  const submissions = await Submission.find({ userId })
    .populate("problemId", "title slug difficulty")
    .sort({ createdAt: -1 });
  res.json(submissions);
});

export const getSubmissionsByProblem = catchAsync(async (req, res) => {
  const query = { problemId: req.params.problemId };
  if (req.user.role === "STUDENT") {
    query.userId = req.user._id;
  }

  if (req.query.contestId) {
    query.contestId = req.query.contestId;
  } else if (req.user.role === "STUDENT") {
    query.contestId = null;
  }

  const submissions = await Submission.find(query)
    .populate("userId", "name department")
    .populate("problemId", "title slug difficulty")
    .sort({ createdAt: -1 });

  res.json(submissions);
});
