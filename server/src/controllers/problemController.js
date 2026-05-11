import { Problem } from "../models/Problem.js";
import { Bookmark } from "../models/Bookmark.js";
import { PracticeSession } from "../models/PracticeSession.js";
import { Submission } from "../models/Submission.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ApiError } from "../utils/ApiError.js";
import { normalizeStarterCode } from "../utils/codeInjection.js";

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const generateProblemCode = () =>
  "CC" + String(Math.floor(100000 + Math.random() * 900000));

const assignProblemCode = async (problem) => {
  if (problem.problemCode) {
    return problem;
  }

  let nextCode = generateProblemCode();

  while (await Problem.exists({ problemCode: nextCode, _id: { $ne: problem._id } })) {
    nextCode = generateProblemCode();
  }

  await Problem.updateOne(
    { _id: problem._id, problemCode: { $in: [null, undefined, ""] } },
    { $set: { problemCode: nextCode } }
  );
  problem.problemCode = nextCode;
  return problem;
};

export const getProblems = catchAsync(async (req, res) => {
  const filter = {};

  if (req.query.difficulty) {
    const normalizedDifficulty =
      req.query.difficulty.charAt(0).toUpperCase() + req.query.difficulty.slice(1).toLowerCase();
    filter.difficulty = normalizedDifficulty;
  }

  if (req.query.tags) {
    const tags = req.query.tags.split(",").map((item) => item.trim()).filter(Boolean);
    if (tags.length) {
      filter.tags = { $in: tags };
    }
  }

  if (req.query.search) {
    const searchValue = req.query.search.trim();
    filter.$or = [
      { title: { $regex: searchValue, $options: "i" } },
      { problemCode: { $regex: searchValue, $options: "i" } },
      { tags: { $regex: searchValue, $options: "i" } },
    ];
  }

  const problemDocs = await Problem.find(filter).sort({ createdAt: -1 });
  const problems = await Promise.all(problemDocs.map((problem) => assignProblemCode(problem).then((entry) => entry.toObject())));
  
  const [submittedProblemIds, malpracticeProblemIds, bookmarks, solvedCounts] = await Promise.all([
    Submission.distinct("problemId", { userId: req.user._id, contestId: null, status: "Accepted" }),
    PracticeSession.distinct("problemId", { userId: req.user._id, malpractice: true }),
    Bookmark.find({ userId: req.user._id }).lean(),
    Submission.aggregate([
      { $match: { status: "Accepted", contestId: null } },
      { $group: { _id: { problemId: "$problemId", userId: "$userId" } } },
      { $group: { _id: "$_id.problemId", count: { $sum: 1 } } }
    ])
  ]);

  const submittedSet = new Set(submittedProblemIds.map(String));
  const malpracticeSet = new Set(malpracticeProblemIds.map(String));
  const bookmarkSet = new Set(bookmarks.map((item) => String(item.problemId)));
  const solvedCountMap = new Map(solvedCounts.map(item => [String(item._id), item.count]));

  const statusFilter = req.query.status;
  const decorated = problems.map((problem) => ({
    ...problem,
    solved: submittedSet.has(String(problem._id)),
    submitted: submittedSet.has(String(problem._id)),
    malpractice: malpracticeSet.has(String(problem._id)),
    bookmarked: bookmarkSet.has(String(problem._id)),
    totalSolved: solvedCountMap.get(String(problem._id)) || 0,
  }));

  // Automatically hide solved problems unless explicitly requesting them
  const filtered = statusFilter
    ? decorated.filter((problem) => (statusFilter.toLowerCase() === "solved" ? problem.solved : !problem.solved))
    : decorated.filter((problem) => !problem.solved);

  res.json(filtered);
});

export const getProblemBySlug = catchAsync(async (req, res) => {
  const problem = await Problem.findOne({ slug: req.params.slug });
  if (!problem) {
    throw new ApiError(404, "Problem not found.");
  }

  await assignProblemCode(problem);

  const submissionQuery = {
    userId: req.user._id,
    problemId: problem._id,
  };

  if (req.query.contestId) {
    submissionQuery.contestId = req.query.contestId;
  } else {
    submissionQuery.contestId = null;
  }

  const [submissions, bookmarked] = await Promise.all([
    Submission.find(submissionQuery).sort({ createdAt: -1 }).limit(20),
    Bookmark.findOne({ userId: req.user._id, problemId: problem._id }),
  ]);

  const payload = problem.toObject();

  res.json({
    ...payload,
    starterCode: normalizeStarterCode(payload.starterCode),
    bookmarked: Boolean(bookmarked),
    submissions,
  });
});

export const createProblem = catchAsync(async (req, res) => {
  const slug = req.body.slug ? slugify(req.body.slug) : slugify(req.body.title);
  const existing = await Problem.findOne({ slug });
  if (existing) {
    throw new ApiError(409, "Problem slug already exists.");
  }

  let problemCode = generateProblemCode();

  while (await Problem.exists({ problemCode })) {
    problemCode = generateProblemCode();
  }

  const problem = await Problem.create({
    ...req.body,
    slug,
    problemCode,
    createdBy: req.user._id,
  });
  res.status(201).json(problem);
});

export const updateProblem = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  if (payload.slug) {
    payload.slug = slugify(payload.slug);
  }
  const problem = await Problem.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!problem) {
    throw new ApiError(404, "Problem not found.");
  }
  res.json(problem);
});

export const deleteProblem = catchAsync(async (req, res) => {
  const problem = await Problem.findByIdAndDelete(req.params.id);
  if (!problem) {
    throw new ApiError(404, "Problem not found.");
  }
  res.status(204).send();
});

export const toggleBookmark = catchAsync(async (req, res) => {
  const problem = await Problem.findById(req.params.id);
  if (!problem) {
    throw new ApiError(404, "Problem not found.");
  }

  const existing = await Bookmark.findOne({ userId: req.user._id, problemId: problem._id });
  if (existing) {
    await existing.deleteOne();
    return res.json({ bookmarked: false });
  }

  await Bookmark.create({ userId: req.user._id, problemId: problem._id });
  return res.json({ bookmarked: true });
});
