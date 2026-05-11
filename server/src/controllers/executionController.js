import { Contest } from "../models/Contest.js";
import { PracticeSession } from "../models/PracticeSession.js";
import { Problem } from "../models/Problem.js";
import { Submission } from "../models/Submission.js";
import { executionQueue } from "../services/executionQueue.js";
import { executeCode } from "../services/executionService.js";
import { evaluateSubmission } from "../services/judgeService.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ApiError } from "../utils/ApiError.js";
import { buildExecutableCode } from "../utils/codeInjection.js";

export const runCode = catchAsync(async (req, res) => {
  const problem = req.body.problemId ? await Problem.findById(req.body.problemId) : null;
  let finalCode = req.body.code;
  if (problem?.driverCode?.[req.body.language]) {
    finalCode = buildExecutableCode({
      driverCode: problem.driverCode[req.body.language],
      userCode: finalCode,
      language: req.body.language,
    });
  }

  const result = await executeCode({
    code: finalCode,
    language: req.body.language,
    stdin: req.body.stdin || "",
    timeLimitMs: problem?.timeLimitMs || 2000,
    memoryLimitMb: problem?.memoryLimitMb || 256,
  });
  res.json(result);
});

export const submitSolution = catchAsync(async (req, res) => {
  const problem = await Problem.findById(req.body.problemId);
  if (!problem) {
    throw new ApiError(404, "Problem not found.");
  }

  let contestId = null;
  let practiceSessionId = null;

  if (req.body.contestId) {
    const contest = await Contest.findById(req.body.contestId);

    if (!contest) {
      throw new ApiError(404, "Contest not found.");
    }

    const now = Date.now();

    if (now < contest.startTime.getTime()) {
      throw new ApiError(400, "Contest has not started yet.");
    }

    if (now > contest.endTime.getTime()) {
      throw new ApiError(400, "Contest has already ended.");
    }

    const isContestProblem = contest.problems.some(
      (entry) => String(entry.problemId) === String(problem._id)
    );

    if (!isContestProblem) {
      throw new ApiError(400, "Problem is not part of this contest.");
    }

    contestId = contest._id;
  }

  // Count how many times this user has already submitted this problem (outside contests)
  const MAX_ATTEMPTS = 10;
  const priorSubmissions = await Submission.find({
    userId: req.user._id,
    problemId: problem._id,
    contestId,
  }).select("_id").lean();

  if (priorSubmissions.length >= MAX_ATTEMPTS) {
    throw new ApiError(
      429,
      contestId
        ? "You have reached the maximum number of attempts for this contest problem."
        : `You have attempted this problem the maximum number of times (${MAX_ATTEMPTS}). No further submissions are allowed.`
    );
  }

  // Score is only awarded on the very first submission
  const isFirstSubmission = priorSubmissions.length === 0;

  if (!contestId && req.body.practiceSessionId) {
    const session = await PracticeSession.findById(req.body.practiceSessionId);

    if (!session || String(session.userId) !== String(req.user._id)) {
      throw new ApiError(404, "Practice session not found.");
    }

    if (String(session.problemId) !== String(problem._id)) {
      throw new ApiError(400, "Practice session does not match this problem.");
    }

    if (session.status !== "ACTIVE" || session.malpractice) {
      throw new ApiError(
        400,
        session.terminationReason ||
          "This protected practice session is no longer active."
      );
    }

    practiceSessionId = session._id;
    session.status = "SUBMITTED";
    session.endedAt = new Date();
    await session.save();
  }

  const submission = await Submission.create({
    userId: req.user._id,
    problemId: problem._id,
    difficulty: problem.difficulty,
    contestId,
    code: req.body.code,
    language: req.body.language,
    isFirstSubmission,
  });

  const job = await executionQueue.add("evaluate-submission", {
    submissionId: submission._id.toString(),
  });

  res.status(202).json({
    submissionId: submission._id,
    jobId: job.id,
    status: "Queued",
    practiceSessionId,
  });
});

export const processSubmissionEvaluation = async ({ submissionId }) => evaluateSubmission({ submissionId });
