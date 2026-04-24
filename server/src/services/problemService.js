import { Problem } from "../models/Problem.js";
import { Submission } from "../models/Submission.js";

export const getProblemsWithSubmissionStats = async (userId) => {
  const problems = await Problem.find().sort({ createdAt: -1 }).lean();
  const userSubmissions = await Submission.find({ userId }).lean();
  const passedByProblem = new Map();

  for (const submission of userSubmissions) {
    if (submission.status === "Accepted") {
      passedByProblem.set(String(submission.problemId), true);
    }
  }

  return problems.map((problem) => ({
    ...problem,
    solved: passedByProblem.has(String(problem._id)),
  }));
};
