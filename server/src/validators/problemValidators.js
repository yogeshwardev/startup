import { body } from "express-validator";

export const createProblemValidator = [
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("description").trim().notEmpty().withMessage("Description is required."),
  body("difficulty").isIn(["Easy", "Medium", "Hard"]).withMessage("Difficulty is invalid."),
  body("category").optional().trim(),
  body("companyId").optional().trim(),
  body("tags").optional().isArray().withMessage("tags must be an array."),
  body("constraints").optional().isArray().withMessage("constraints must be an array."),
  body("visibleTestCases").optional().isArray().withMessage("visibleTestCases must be an array."),
  body("hiddenTestCases").optional().isArray().withMessage("hiddenTestCases must be an array."),
  body("examples").optional().isArray().withMessage("examples must be an array."),
  body("supportedLanguages").optional().isArray({ min: 1 }).withMessage("supportedLanguages must be an array."),
  body("timeLimitMs").optional().isInt({ min: 500, max: 5000 }).withMessage("timeLimitMs must be between 500 and 5000."),
  body("memoryLimitMb").optional().isInt({ min: 64, max: 1024 }).withMessage("memoryLimitMb must be between 64 and 1024."),
];

export const updateProblemValidator = [
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty."),
  body("difficulty").optional().isIn(["Easy", "Medium", "Hard"]).withMessage("Difficulty is invalid."),
  body("category").optional().trim(),
  body("companyId").optional().trim(),
  body("tags").optional().isArray().withMessage("tags must be an array."),
  body("constraints").optional().isArray().withMessage("constraints must be an array."),
];
