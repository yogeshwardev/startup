import { Problem } from "../models/Problem.js";
import { Submission } from "../models/Submission.js";
import { DailyChallenge } from "../models/DailyChallenge.js";
import { executeCode } from "./executionService.js";
import { buildDepartmentWar, buildLeaderboards } from "./leaderboardService.js";
import { emitLeaderboardUpdate } from "./socketService.js";

const difficultyScore = {
  Easy: 10,
  Medium: 20,
  Hard: 30,
};

const normalizeOutput = (value = "") => value.trim().replace(/\r\n/g, "\n");

export const evaluateSubmission = async ({ submissionId }) => {
  const submission = await Submission.findById(submissionId).populate("problemId");
  if (!submission || !submission.problemId) {
    return null;
  }

  const problem = submission.problemId;
  const tests = problem.hiddenTestCases || [];
  const results = [];
  let finalStatus = "Accepted";
  let maxRuntime = 0;
  let stderr = "";
  let stdout = "";

  let finalCode = submission.code;
  if (problem.driverCode?.[submission.language]) {
    const driver = problem.driverCode[submission.language];
    const marker = submission.language === "python" ? "# __USER_CODE_HERE__" : "// __USER_CODE_HERE__";
    if (driver.includes(marker)) {
      finalCode = driver.replace(marker, finalCode);
    }
  }

  for (const testCase of tests) {
    const execution = await executeCode({
      code: finalCode,
      language: submission.language,
      stdin: testCase.input,
      timeLimitMs: problem.timeLimitMs,
      memoryLimitMb: problem.memoryLimitMb,
    });

    maxRuntime = Math.max(maxRuntime, execution.executionTimeMs || 0);
    stdout = execution.stdout;
    stderr = execution.stderr;

    let status = "Accepted";
    if (execution.timedOut) {
      status = "Time Limit Exceeded";
      finalStatus = status;
    } else if (execution.stderr) {
      status = "Runtime Error";
      finalStatus = status;
    } else if (normalizeOutput(execution.stdout) !== normalizeOutput(testCase.expectedOutput)) {
      status = "Wrong Answer";
      finalStatus = status;
    }

    results.push({
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: execution.stdout,
      status,
      runtime: execution.executionTimeMs || 0,
    });

    if (status !== "Accepted") {
      break;
    }
  }

  const passedCount = results.filter((item) => item.status === "Accepted").length;
  const score = finalStatus === "Accepted" ? difficultyScore[problem.difficulty] || 0 : 0;
  const updated = await Submission.findByIdAndUpdate(
    submissionId,
    {
      status: finalStatus,
      runtime: maxRuntime,
      memory: problem.memoryLimitMb,
      score,
      passedCount,
      totalCount: tests.length,
      stdout,
      stderr,
      testResults: results,
      isDailyChallenge: false,
    },
    { new: true }
  );

  const today = new Date().toISOString().slice(0, 10);
  const dailyChallenge = await DailyChallenge.findOne({ date: today, problemId: problem._id });
  if (dailyChallenge && finalStatus === "Accepted") {
    const alreadyCompleted = dailyChallenge.completions.some((entry) => String(entry.userId) === String(submission.userId));
    if (!alreadyCompleted) {
      dailyChallenge.completions.push({ userId: submission.userId, completedAt: new Date() });
      await dailyChallenge.save();
      await Submission.findByIdAndUpdate(submissionId, { isDailyChallenge: true });
    }
  }

  const [leaderboards, departmentWar] = await Promise.all([buildLeaderboards(), buildDepartmentWar()]);
  emitLeaderboardUpdate({ leaderboards, departmentWar });

  return updated;
};

export const ensureDailyChallenge = async () => {
  const today = new Date().toISOString().slice(0, 10);
  let challenge = await DailyChallenge.findOne({ date: today }).populate("problemId");
  if (challenge) {
    return challenge;
  }

  const count = await DailyChallenge.countDocuments();
  const candidates = await Problem.find({ isDailyEligible: true }).sort({ createdAt: 1 });
  if (!candidates.length) {
    return null;
  }

  const problem = candidates[count % candidates.length];
  challenge = await DailyChallenge.create({
    date: today,
    problemId: problem._id,
  });

  return DailyChallenge.findById(challenge._id).populate("problemId");
};
