import { PracticeSession } from "../models/PracticeSession.js";
import { Problem } from "../models/Problem.js";
import { Submission } from "../models/Submission.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ApiError } from "../utils/ApiError.js";

const MAX_WARNINGS = 3;

export const startPracticeSession = catchAsync(async (req, res) => {
  const problem = await Problem.findById(req.body.problemId).select("_id");

  if (!problem) {
    throw new ApiError(404, "Problem not found.");
  }

  const existingSubmission = await Submission.findOne({
    userId: req.user._id,
    problemId: problem._id,
    contestId: null,
  }).select("_id");

  if (existingSubmission) {
    throw new ApiError(400, "You have already submitted this problem.");
  }

  const activeSession = await PracticeSession.findOne({
    userId: req.user._id,
    problemId: problem._id,
    status: "ACTIVE",
  }).sort({ createdAt: -1 });

  if (activeSession) {
    return res.json({
      sessionId: activeSession._id,
      status: activeSession.status,
      warningCount: activeSession.warningCount,
      malpractice: activeSession.malpractice,
    });
  }

  const malpracticeSession = await PracticeSession.findOne({
    userId: req.user._id,
    problemId: problem._id,
    malpractice: true,
  }).sort({ createdAt: -1 });

  if (malpracticeSession) {
    throw new ApiError(
      403,
      malpracticeSession.terminationReason ||
        "This practice session was terminated for malpractice and cannot be restarted."
    );
  }

  const session = await PracticeSession.create({
    userId: req.user._id,
    problemId: problem._id,
  });

  res.status(201).json({
    sessionId: session._id,
    status: session.status,
    warningCount: session.warningCount,
    malpractice: session.malpractice,
  });
});

export const getPracticeSessionByProblem = catchAsync(async (req, res) => {
  const session = await PracticeSession.findOne({
    userId: req.user._id,
    problemId: req.params.problemId,
  }).sort({ createdAt: -1 });

  if (!session) {
    return res.json(null);
  }

  res.json({
    sessionId: session._id,
    status: session.status,
    warningCount: session.warningCount,
    malpractice: session.malpractice,
    terminationReason: session.terminationReason,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
  });
});

export const reportPracticeViolation = catchAsync(async (req, res) => {
  const session = await PracticeSession.findById(req.params.id);

  if (!session || String(session.userId) !== String(req.user._id)) {
    throw new ApiError(404, "Practice session not found.");
  }

  if (session.status !== "ACTIVE") {
    return res.json({
      status: session.status,
      warningCount: session.warningCount,
      malpractice: session.malpractice,
      terminationReason: session.terminationReason,
    });
  }

  session.warningCount += 1;

  session.violations.push({
    reason: req.body.reason,
    eventType: req.body.eventType,
    warningCount: session.warningCount,
  });

  if (session.warningCount > MAX_WARNINGS) {
    session.status = "TERMINATED";
    session.malpractice = true;
    session.terminationReason = req.body.reason;
    session.endedAt = new Date();
  }

  await session.save();

  res.json({
    status: session.status,
    warningCount: session.warningCount,
    malpractice: session.malpractice,
    terminationReason: session.terminationReason,
    maxWarnings: MAX_WARNINGS,
  });
});
