import { Company } from "../models/Company.js";
import { Question } from "../models/Question.js";
import { UserProgress } from "../models/UserProgress.js";
import { catchAsync } from "../utils/catchAsync.js";
import { ApiError } from "../utils/ApiError.js";
import { normalizeStarterCode } from "../utils/codeInjection.js";

// Get all companies
export const getAllCompanies = catchAsync(async (req, res) => {
  const companies = await Company.find().lean();
  
  const questionCounts = await Question.aggregate([
    {
      $group: {
        _id: "$companyName",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = questionCounts.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const enhancedCompanies = companies.map((c) => ({
    ...c,
    totalQuestions: countMap[c.name] || 0,
  }));

  res.json(enhancedCompanies);
});

// Get company by name with questions summary
export const getCompanyDetails = catchAsync(async (req, res) => {
  const { name } = req.params;
  const company = await Company.findOne({ name }).lean();

  if (!company) {
    throw new ApiError(404, "Company not found.");
  }

  // Get question counts by type and difficulty
  const questionStats = await Question.aggregate([
    { $match: { companyName: name } },
    {
      $group: {
        _id: { type: "$type", difficulty: "$difficulty" },
        count: { $sum: 1 },
      },
    },
  ]);

  res.json({
    ...company,
    questionStats,
  });
});

// Get questions for a company
export const getCompanyQuestions = catchAsync(async (req, res) => {
  const { name } = req.params;
  const { type, difficulty, topic, page = 1, limit = 100 } = req.query;

  console.log("=== GET COMPANY QUESTIONS ===");
  console.log("Params:", { name, type, difficulty, topic, page, limit });

  const query = { companyName: name };
  if (type) query.type = type;
  if (difficulty) query.difficulty = difficulty;
  if (topic) query.topic = topic;

  console.log("Final query:", JSON.stringify(query));
  
  try {
    const skip = (page - 1) * parseInt(limit);
    console.log("Skip:", skip, "Limit:", parseInt(limit));

    const [questions, total] = await Promise.all([
      Question.find(query)
        .select("-solution -constraints -examples -hints -description")
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Question.countDocuments(query),
    ]);

    console.log(`✅ Found ${total} total matching questions, returning ${questions.length}`);

    res.json({
      questions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("❌ Error in getCompanyQuestions:", error);
    throw error;
  }
});

// Get single question by ID
export const getQuestion = catchAsync(async (req, res) => {
  const { id } = req.params;
  const question = await Question.findById(id).lean();

  if (!question) {
    throw new ApiError(404, "Question not found.");
  }

  res.json({
    ...question,
    starterCode: normalizeStarterCode(question.starterCode),
  });
});

// Get questions by topic
export const getQuestionsByTopic = catchAsync(async (req, res) => {
  const { name } = req.params;
  const { topic, difficulty } = req.query;

  const query = { companyName: name, topic };
  if (difficulty) query.difficulty = difficulty;

  const questions = await Question.find(query)
    .select("title difficulty type tags")
    .lean();

  res.json(questions);
});

// Get all topics for a company
export const getCompanyTopics = catchAsync(async (req, res) => {
  const { name } = req.params;
  const { type } = req.query;

  const query = { companyName: name };
  if (type) query.type = type;

  console.log("Fetching topics with query:", query);
  
  const topics = await Question.distinct("topic", query);
  
  console.log(`Found topics:`, topics);

  res.json({
    topics: topics.sort(),
  });
});

// Mark question as solved
export const markQuestionSolved = catchAsync(async (req, res) => {
  const { questionId } = req.body;
  const userId = req.user._id;

  const question = await Question.findById(questionId).lean();
  if (!question) {
    throw new ApiError(404, "Question not found.");
  }

  let progress = await UserProgress.findOne({ userId });

  if (!progress) {
    progress = new UserProgress({ userId });
  }

  const existingSolved = progress.solvedQuestions.find(
    (q) => String(q.questionId) === String(questionId)
  );

  if (!existingSolved) {
    progress.solvedQuestions.push({
      questionId,
      companyName: question.companyName,
    });

    // Update company progress
    const companyProgress = progress.companyProgress.find(
      (c) => c.companyName === question.companyName
    );

    if (companyProgress) {
      companyProgress.totalQuestionsAttempted += 1;
      companyProgress[`${question.difficulty}Count`] += 1;
      companyProgress.lastAccessed = new Date();
    } else {
      progress.companyProgress.push({
        companyName: question.companyName,
        totalQuestionsAttempted: 1,
        [`${question.difficulty}Count`]: 1,
        lastAccessed: new Date(),
      });
    }
  }

  await progress.save();

  res.json({
    message: "Question marked as solved",
    solvedCount: progress.solvedQuestions.length,
  });
});

// Bookmark/Unbookmark question
export const toggleBookmarkQuestion = catchAsync(async (req, res) => {
  const { questionId } = req.body;
  const userId = req.user._id;

  let progress = await UserProgress.findOne({ userId });

  if (!progress) {
    progress = new UserProgress({ userId });
  }

  const bookmarkIndex = progress.bookmarkedQuestions.findIndex(
    (q) => String(q) === String(questionId)
  );

  if (bookmarkIndex > -1) {
    progress.bookmarkedQuestions.splice(bookmarkIndex, 1);
  } else {
    progress.bookmarkedQuestions.push(questionId);
  }

  await progress.save();

  res.json({
    bookmarked: bookmarkIndex === -1,
    bookmarkCount: progress.bookmarkedQuestions.length,
  });
});

// Get user progress
export const getUserProgress = catchAsync(async (req, res) => {
  const userId = req.user._id;

  let progress = await UserProgress.findOne({ userId }).populate(
    "bookmarkedQuestions",
    "title topic difficulty"
  );

  if (!progress) {
    progress = new UserProgress({ userId });
    await progress.save();
  }

  const stats = {
    totalSolved: progress.solvedQuestions.length,
    totalBookmarked: progress.bookmarkedQuestions.length,
    companyProgress: progress.companyProgress,
    solvedByDifficulty: {
      easy: progress.solvedQuestions.filter(
        (q) => q.difficulty === "easy"
      ).length,
      medium: progress.solvedQuestions.filter(
        (q) => q.difficulty === "medium"
      ).length,
      hard: progress.solvedQuestions.filter(
        (q) => q.difficulty === "hard"
      ).length,
    },
  };

  res.json({
    progress: stats,
    bookmarkedQuestions: progress.bookmarkedQuestions,
  });
});

// Submit solution for a placement question
export const submitPlacementSolution = catchAsync(async (req, res) => {
  const { questionId, code, language } = req.body;
  const userId = req.user._id;

  const question = await Question.findById(questionId);
  if (!question) {
    throw new ApiError(404, "Question not found.");
  }

  // Mark as solved in user progress
  let progress = await UserProgress.findOne({ userId });
  if (!progress) {
    progress = new UserProgress({ userId });
  }

  const existingSolved = progress.solvedQuestions.find(
    (q) => String(q.questionId) === String(questionId)
  );

  if (!existingSolved) {
    progress.solvedQuestions.push({
      questionId,
      companyName: question.companyName,
    });
    await progress.save();
  }

  // For now, return a success response
  // In a production system, you would:
  // 1. Execute the code against test cases
  // 2. Store the submission in a database
  // 3. Return detailed test results

  res.json({
    message: "Solution submitted successfully",
    questionId,
    language,
    submittedAt: new Date(),
  });
});

// Get submissions for a placement question
export const getPlacementSubmissions = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const question = await Question.findById(id);
  if (!question) {
    throw new ApiError(404, "Question not found.");
  }

  // Return empty array for now - in production, fetch from database
  res.json([]);
});

// ADMIN ENDPOINTS

// Create a new company
export const createCompany = catchAsync(async (req, res) => {
  const { name, logo, type, focusAreas, interviewProcess, description, website } = req.body;

  const existingCompany = await Company.findOne({ name });
  if (existingCompany) {
    throw new ApiError(400, "Company with this name already exists.");
  }

  const company = await Company.create({
    name,
    logo,
    type,
    focusAreas,
    interviewProcess,
    description,
    website,
  });

  res.status(201).json(company);
});

// Update company details
export const updateCompany = catchAsync(async (req, res) => {
  const { name } = req.params;
  const { logo, type, focusAreas, interviewProcess, description, website } = req.body;

  const company = await Company.findOneAndUpdate(
    { name },
    { logo, type, focusAreas, interviewProcess, description, website },
    { new: true, runValidators: true }
  );

  if (!company) {
    throw new ApiError(404, "Company not found.");
  }

  res.json(company);
});

// Delete a company
export const deleteCompany = catchAsync(async (req, res) => {
  const { name } = req.params;

  const company = await Company.findOneAndDelete({ name });
  if (!company) {
    throw new ApiError(404, "Company not found.");
  }

  // Delete all questions for this company
  await Question.deleteMany({ companyName: name });

  res.json({ message: "Company deleted successfully" });
});

// Add question to a company
export const addQuestion = catchAsync(async (req, res) => {
  const { companyName, type, category, topic, difficulty, title, description, constraints, examples, solution, tags, hints } = req.body;

  const company = await Company.findOne({ name: companyName });
  if (!company) {
    throw new ApiError(404, "Company not found.");
  }

  const question = await Question.create({
    companyName,
    type,
    category,
    topic,
    difficulty,
    title,
    description,
    constraints,
    examples,
    solution,
    tags,
    hints,
  });

  res.status(201).json(question);
});

// Update a question
export const updateQuestion = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { type, category, topic, difficulty, title, description, constraints, examples, solution, tags, hints } = req.body;

  const question = await Question.findByIdAndUpdate(
    id,
    { type, category, topic, difficulty, title, description, constraints, examples, solution, tags, hints },
    { new: true, runValidators: true }
  );

  if (!question) {
    throw new ApiError(404, "Question not found.");
  }

  res.json(question);
});

// Delete a question
export const deleteQuestion = catchAsync(async (req, res) => {
  const { id } = req.params;

  const question = await Question.findByIdAndDelete(id);
  if (!question) {
    throw new ApiError(404, "Question not found.");
  }

  res.json({ message: "Question deleted successfully" });
});

// Get all questions for a company (admin view)
export const getCompanyQuestionsAdmin = catchAsync(async (req, res) => {
  const { name } = req.params;
  const { type, difficulty, page = 1, limit = 20 } = req.query;

  const query = { companyName: name };
  if (type) query.type = type;
  if (difficulty) query.difficulty = difficulty;

  const skip = (page - 1) * limit;

  const [questions, total] = await Promise.all([
    Question.find(query).skip(skip).limit(parseInt(limit)).lean(),
    Question.countDocuments(query),
  ]);

  res.json({
    questions,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    },
  });
});
